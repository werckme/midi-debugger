import { eventDataToString, eventTypeToString, midiNumberToNoteNameHtml, getTracks } from "./MidiHelper";
import * as MidiEvents from 'midievents';
import * as _ from 'lodash';

export class PianoRollView {
    element = null;
    ppq = 0;
    eventList = null;
    xscale = 100;
    maxWidth = 0;
    constructor(element, trackFilter) {
        this.element = element;
        this.trackFilter = trackFilter;
    }

    update(midifile) {
        this.element.innerHTML = '';
        this.ppq = midifile.header.getTicksPerBeat();
        this.render(midifile);
    }

    eventPosAndDuration(noteOn, noteOff) {
        return `@${noteOn.absPosition.toFixed(3)} - ${noteOff.absPosition.toFixed(3)}`;
    }

    renderEvent(track, event) {
        const isNoteOn = event.type === MidiEvents.EVENT_MIDI && event.subtype === MidiEvents.EVENT_MIDI_NOTE_ON;
        const isNoteOff = event.type === MidiEvents.EVENT_MIDI && event.subtype === MidiEvents.EVENT_MIDI_NOTE_OFF;
        if (!isNoteOn && !isNoteOff) {
            return;
        }
        const eventPitch = event.param1;
        if (isNoteOn) {
            let pitchGroup = track.pitches[eventPitch];
            pitchGroup.elements.push(event);
            return;
        }
        const pitches = track.pitches[eventPitch];
        const pitchContainer = pitches.container;
        const noteOn = _.last(pitches.elements);
        const noteHasAlreadyDuration = noteOn.duration !== undefined;
        if (noteHasAlreadyDuration) {
            console.warn(`corresponding midi on note not found`)
            return;
        }
        noteOn.duration = event.absPosition - noteOn.absPosition;
        const eventElement = document.createElement('div');
        eventElement.classList.add("event");
        eventElement.classList.add(`velocity-${noteOn.param2}`);
        eventElement.style.width = `${noteOn.duration * this.xscale}px`;
        eventElement.style.left = `${noteOn.absPosition * this.xscale}px`;
        const eventText = `${eventDataToString(noteOn)}${this.eventPosAndDuration(noteOn, event)}`;
        const textElement = document.createElement('span');
        eventElement.title = 
        textElement.textContent = eventText;
        eventElement.appendChild(textElement);
        pitchContainer.appendChild(eventElement);
    }
    quarters = 0;

    createPitchGroups(track) {
        for(let pitch=127; pitch >= 0; --pitch) {
            const pitchName = midiNumberToNoteNameHtml(pitch);
            const pitchContainer = document.createElement('div');
            pitchContainer.classList.add("pitch-group");
            pitchContainer.classList.add(pitchName);
            track.pitches[pitch] = {elements: [], container: pitchContainer};
            track.container.appendChild(pitchContainer);
        }
    }

    postProcess(tracks) {
        this.maxWidth = this.xscale * _(tracks)
            .values()
            .map(x=>x.pitches)
            .flatten()
            .map(x=>x.elements)
            .map(x=>_.last(x))
            .filter(x=>!!x)
            .map(x=>x.absPosition + x.duration)
            .max();

        for(const trackNr in tracks) {
            const track = tracks[trackNr];
            const pitchGroupElements = _(track.pitches)
                .filter(x=>x.elements.length > 0)
                .map(x=>x.container)
                .value();
            for(const pitchGroupElement of pitchGroupElements) {
                pitchGroupElement.classList.add("pitch-group-hasvalue");
                pitchGroupElement.style.width = `${this.maxWidth}px`;
            }
            if (pitchGroupElements.length === 0) {
                track.container.classList.add("track-empty");
            }
            track.container.style.width = `${this.maxWidth}px`;
        }
    }

    renderGrid(container) {
        const height = container.clientHeight;
        const canvas = document.createElement('canvas');
        const gridStyleDummy = document.createElement('div');
        gridStyleDummy.classList.add('grid-style');
        container.appendChild(gridStyleDummy);
        const gridColor = gridStyleDummy.computedStyleMap().get('color').toString();
        canvas.width = this.maxWidth;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        container.style.width = `${this.maxWidth}px`;
        let x = 0;
        let quarters = 0;
        while(x <= this.maxWidth) {
            quarters += 1;
            x = Math.floor(quarters * this.xscale);
            ctx.strokeStyle = gridColor;
            ctx.lineWidth = 1;
            ctx.moveTo(x, 12);
            ctx.lineTo(x, height);
            ctx.stroke();
            const text = `${quarters.toFixed(2)}`;
            const textMetrics = ctx.measureText(text);
            ctx.fillText(text, x - textMetrics.width/2, 10);
        }
        container.style.background = `url(${canvas.toDataURL("image/png")})`;
    }

    render(midifile) {
        const tracks = {};
        this.quarters = 1;
        if (!this.eventList) {
            this.eventList = document.createElement("div");
            this.eventList.classList.add("piano-roll");
        } else {
            this.eventList.innerHTML = '';
        }
        for (const event of midifile.getEvents()) {
            this.quarters += event.delta / this.ppq;
            event.absPosition = this.quarters;
            let track = tracks[event.track];
            const isTrackSelected = this.trackFilter.selected[event.track];
            if (!isTrackSelected && this.trackFilter.initalized) {
                continue;
            }
            if (!track) {
                track = { container: document.createElement("div"), pitches: [] };
                const title = document.createElement("span");
                title.classList.add("track-title");
                title.textContent = midifile.trackNames[event.track];
                track.container.appendChild(title);
                this.createPitchGroups(track);
                track.container.classList.add("track");
                track.container.classList.add(`track-${event.track}`);
                tracks[event.track] = track;
                this.eventList.appendChild(track.container);
            }
            this.renderEvent(track, event);
        }
        this.postProcess(tracks);
        this.element.appendChild(this.eventList);
        this.renderGrid(this.eventList);
    }
}