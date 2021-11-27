import { eventDataToString, eventTypeToString, midiNumberToNoteNameHtml, getTracks } from "./MidiHelper";
import * as MidiEvents from 'midievents';
import { CheckboxFilterGroup } from './CheckboxFilterGroup';
import * as _ from 'lodash';

export class PianoRollView {
    element = null;
    ppq = 0;
    trackFilter = new CheckboxFilterGroup();
    trackFilterElement = null;
    filterItems = null;
    eventList = null;
    constructor(element) {
        this.element = element;
    }

    update(midifile) {
        this.element.innerHTML = '';
        const tracks = getTracks(midifile);
        const filterItems = tracks.map((x, idx) => ({name: `${x}(${idx})`, value: idx, class_: `wm-dbg-track-${idx}`}));
        const filterChanged = _(filterItems).isEqual(this.filterItems) === false;
        let trackFilterElement = null;
        if (filterChanged) {
            this.filterItems = filterItems;
            this.trackFilterElement = this.trackFilter.createElement(this.filterItems);
        }
        this.trackFilter.onSelectionChanged = () => {
            this.render(midifile);
        };
        this.element.appendChild(this.trackFilterElement);
        this.ppq = midifile.header.getTicksPerBeat();
        this.render(midifile);
    }

    eventPosAndDuration(noteOn, noteOff) {
        return `@${noteOn.absPosition.toFixed(3)} - ${noteOff.absPosition.toFixed(3)}`;
    }

    renderEvent(track, event) {
        const xscale = 100;
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
        eventElement.style.width = `${noteOn.duration * xscale}px`;
        eventElement.style.left = `${noteOn.absPosition * xscale}px`;
        const eventText = eventDataToString(noteOn);
        const textElement = document.createElement('span');
        eventElement.title = `${eventText}${this.eventPosAndDuration(noteOn, event)}`;
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
        for(const trackNr in tracks) {
            const track = tracks[trackNr];
            const pitchElements = _(track.pitches)
                .map(x=>x.elements)
                .filter(x=>x.length > 0)
                .value();
            if (pitchElements.length === 0) {
                track.container.classList.add("track-empty");
            }
        }
    }

    render(midifile) {
        const tracks = {};
        this.quarters = 0;
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
            if (!isTrackSelected) {
                continue;
            }
            if (!track) {
                track = { container: document.createElement("div"), pitches: [] };
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
    }
}