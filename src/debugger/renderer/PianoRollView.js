import { eventDataToString, eventTypeToString, midiNumberToNoteNameHtml, getTracks } from "./MidiHelper";
import * as MidiEvents from 'midievents';
import * as _ from 'lodash';
import { AView } from "./AView";

const eventTextChildIndex = 0;

const cuePitchIndex = 0;

export class PianoRollView extends AView {
    element = null;
    ppq = 0;
    eventList = null;
    xscale = 100;
    maxWidth = 0;
    quarters = 0;
    constructor(element, trackFilter) {
        super();
        this.element = element;
        this.trackFilter = trackFilter;
    }

    update(midifile) {
        this.clear();
        this.ppq = midifile.header.getTicksPerBeat();
        this.render(midifile);
    }

    eventPosAndDuration(noteOn, noteOff) {
        return ` ${noteOn.absPosition.toFixed(3)} - ${noteOff.absPosition.toFixed(3)}`;
    }

    updateEventLabelImpl(element, htmlText) {
        const labelElement = element.childNodes[eventTextChildIndex];
        labelElement.innerHTML = htmlText;
        labelElement.title = labelElement.textContent;
    }

    getEventLabelImpl(element) {
        return element.childNodes[eventTextChildIndex].innerHTML;
    }

    renderCue(track, event) {
        const pitches = track.pitches[cuePitchIndex];
        pitches.elements.push(event);
        const pitchContainer = pitches.container;
        const eventElement = document.createElement('div');
        eventElement.classList.add("event");
        eventElement.classList.add(`velocity-127`);
        eventElement.classList.add(`event-cue`);
        eventElement.style.width = `${1 * this.xscale}px`;
        eventElement.style.left = `${event.absPosition * this.xscale}px`;
        const eventText = `⚑ ${eventDataToString(event)}`;
        const textElement = document.createElement('span');
        eventElement.title = eventText;
        textElement.textContent = eventText;
        eventElement.appendChild(textElement);
        pitchContainer.appendChild(eventElement);
        return eventElement;
    }

    renderEvent(track, event) {
        const isNoteOn = event.type === MidiEvents.EVENT_MIDI && event.subtype === MidiEvents.EVENT_MIDI_NOTE_ON;
        const isNoteOff = event.type === MidiEvents.EVENT_MIDI && event.subtype === MidiEvents.EVENT_MIDI_NOTE_OFF;
        const isCue = event.type === MidiEvents.EVENT_META && event.subtype === MidiEvents.EVENT_META_CUE_POINT;
        if (isCue) {
            return this.renderCue(track, event);
        }
        if (!isNoteOn && !isNoteOff) {
            return;
        }
        const eventLeft = event.absPosition * this.xscale;
        const eventPitch = event.param1;
        if (isNoteOn) {
            let pitchGroup = track.pitches[eventPitch];
            pitchGroup.elements.push(event);
            return;
        }
        const pitches = track.pitches[eventPitch];
        const pitchContainer = pitches.container;
        const noteOn = _.last(pitches.elements);
        if (!noteOn) {
            return;
        }
        const noteHasAlreadyDuration = noteOn.duration !== undefined;
        if (noteHasAlreadyDuration) {
            console.warn(`corresponding midi on note not found`)
            return;
        }
        noteOn.duration = event.absPosition - noteOn.absPosition;
        const eventElement = document.createElement('div');
        eventElement.classList.add("event");
        eventElement.classList.add(`velocity-${noteOn.param2}`);
        eventElement.style.width = `${event.duration * this.xscale}px`;
        eventElement.style.left = `${eventLeft}px`;
        const eventText = `${eventDataToString(noteOn)}${this.eventPosAndDuration(noteOn, event)}`;
        const textElement = document.createElement('span');
        eventElement.title = eventText;
        textElement.textContent = eventText;
        eventElement.appendChild(textElement);
        pitchContainer.appendChild(eventElement);
        return eventElement;
    }

    createPitchGroups(track) {
        const createPitchElement = (pitch) => {
            const pitchName = midiNumberToNoteNameHtml(pitch);
            const pitchContainer = document.createElement('div');
            pitchContainer.classList.add("pitch-group");
            pitchContainer.classList.add(pitchName);
            track.pitches[pitch] = {elements: [], container: pitchContainer};
            track.container.appendChild(pitchContainer);
        };
        for(let pitch=127; pitch >= 0; --pitch) {
            createPitchElement(pitch);
        }
        createPitchElement(cuePitchIndex);
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
        const canvas = document.createElement('div');
        canvas.style.position = "absolute";
        canvas.style.top = "0px";
        canvas.classList.add('grid-style');
        container.appendChild(canvas);
        canvas.width = this.maxWidth;
        canvas.height = height;
        container.style.width = `${this.maxWidth}px`;
        let x = 0;
        let quarters = 0;
        while(x <= this.maxWidth) {
            quarters += 1;
            x = quarters * this.xscale;
            const gridDiv = document.createElement('div');
            const gridLabel = document.createElement('div');
            gridLabel.innerHTML = `${quarters.toFixed(2)-1}`;
            gridDiv.appendChild(gridLabel);
            gridLabel.style.position = "absolute";
            gridDiv.classList.add('grid-element');
            gridDiv.style.position = "absolute";
            gridDiv.style.left = `${x}px`;
            gridDiv.style.width = `2px`;
            gridDiv.style.top = "0px";
            gridDiv.style.height = `${height}px`;
            canvas.appendChild(gridDiv);
        }
    }

    cueContainer = undefined;

    render(midifile) {
        this.beginRender();
        const tracks = {};
        this.quarters = 1;
        if (!this.eventList) {
            this.eventList = document.createElement("div");
            this.eventList.classList.add("piano-roll");
            this.cueContainer = document.createElement("div");
            this.cueContainer.classList.add("cues");
            this.eventList.appendChild(this.cueContainer);
        } else {
            this.eventList.innerHTML = '';
            this.cueContainer.innerHTML = '';
        }
        for (const event of midifile.getEvents()) {
            this.quarters += event.delta / this.ppq;
            event.absPosition = this.quarters;
            const trackIndex = event.track || 0;
            let track = tracks[trackIndex];
            this.visitTrack(trackIndex);
            const isTrackSelected = this.trackFilter.selected[event.track || 0];
            if (!isTrackSelected && this.trackFilter.initalized) {
                continue;
            }
            if (!track) {
                track = { container: document.createElement("div"), pitches: [] };
                const title = document.createElement("span");
                title.classList.add("track-title");
                title.textContent = midifile.trackNames[event.track || 0];
                track.container.appendChild(title);
                this.createPitchGroups(track);
                track.container.classList.add("track");
                track.container.classList.add(`track-${event.track || 0}`);
                tracks[event.track || 0] = track;
                this.eventList.appendChild(track.container);
            }
            const eventElement = this.renderEvent(track, event);
            this.visitEventElement(trackIndex, eventElement);
        }
        this.postProcess(tracks);
        this.element.appendChild(this.eventList);
        this.renderGrid(this.eventList);
        this.endRender();
    }
}