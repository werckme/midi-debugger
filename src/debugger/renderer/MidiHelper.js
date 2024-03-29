import * as MidiEvents from 'midievents';
import * as _ from 'lodash';

const MaxPitchBend = 16383;

export function eventTypeToString(event) {
    if (event.type === MidiEvents.EVENT_MIDI) {
        switch (event.subtype) {
            case MidiEvents.EVENT_MIDI_NOTE_OFF: return 'note off';
            case MidiEvents.EVENT_MIDI_NOTE_ON: return 'note on';
            case MidiEvents.EVENT_MIDI_NOTE_AFTERTOUCH: return '';
            case MidiEvents.EVENT_MIDI_CONTROLLER: return 'cc';
            case MidiEvents.EVENT_MIDI_PROGRAM_CHANGE: return 'pc';
            case MidiEvents.EVENT_MIDI_CHANNEL_AFTERTOUCH: return 'after t.';
            case MidiEvents.EVENT_MIDI_PITCH_BEND: return 'p. bend';
            default: return `0x${event.subtype.toString(16)}`;
        }
    }
    if (event.type === MidiEvents.EVENT_META) {
        switch (event.subtype) {
            case MidiEvents.EVENT_META_SEQUENCE_NUMBER: return 'seq nr.';
            case MidiEvents.EVENT_META_TEXT: return 'text';
            case MidiEvents.EVENT_META_COPYRIGHT_NOTICE: return '©';
            case MidiEvents.EVENT_META_TRACK_NAME: return 'track';
            case MidiEvents.EVENT_META_INSTRUMENT_NAME: return 'instrument';
            case MidiEvents.EVENT_META_LYRICS: return 'lyrics';
            case MidiEvents.EVENT_META_MARKER: return 'marker';
            case MidiEvents.EVENT_META_CUE_POINT: return 'cue';
            case MidiEvents.EVENT_META_MIDI_CHANNEL_PREFIX: return 'ch. prefix';
            case MidiEvents.EVENT_META_END_OF_TRACK: return 'eot';
            case MidiEvents.EVENT_META_SET_TEMPO: return 'tempo';
            case MidiEvents.EVENT_META_SMTPE_OFFSET: return 'smtpe off.';
            case MidiEvents.EVENT_META_TIME_SIGNATURE: return 'time sig.';
            case MidiEvents.EVENT_META_KEY_SIGNATURE: return 'key sig.';
            case MidiEvents.EVENT_META_SEQUENCER_SPECIFIC: return 'custom';
        }
    }
    if (event.type === MidiEvents.EVENT_SYSEX) {
        return "sysex";
    }
    return "unknown midi type";
}

export function eventDataToString(event) {
    if (event.type === MidiEvents.EVENT_META
        && (event.subtype === MidiEvents.EVENT_META_TEXT
            || event.subtype === MidiEvents.EVENT_META_COPYRIGHT_NOTICE
            || event.subtype === MidiEvents.EVENT_META_TRACK_NAME
            || event.subtype === MidiEvents.EVENT_META_INSTRUMENT_NAME
            || event.subtype === MidiEvents.EVENT_META_LYRICS
            || event.subtype === MidiEvents.EVENT_META_MARKER
            || event.subtype === MidiEvents.EVENT_META_CUE_POINT)) {
        return String.fromCharCode(...event.data);
    }
    if (event.type === MidiEvents.EVENT_MIDI
        && (event.subtype === MidiEvents.EVENT_MIDI_NOTE_ON
            || event.subtype === MidiEvents.EVENT_MIDI_NOTE_OFF)) {
        return `${midiNumberToNoteName(event.param1)}(${event.param2})`;
    }
    if (event.type === MidiEvents.EVENT_META && event.subtype === MidiEvents.EVENT_META_TIME_SIGNATURE) {
        return `${event.param1}/${Math.round(Math.exp(event.param2 * Math.log(2)))}`;
    }
    if (event.type === MidiEvents.EVENT_MIDI 
        && (event.subtype === MidiEvents.EVENT_MIDI_PITCH_BEND)) {
        return ((event.param2 << 7 | event.param1) / MaxPitchBend).toFixed(6);
    }
    if (event.type === MidiEvents.EVENT_SYSEX) {
        const numBytesToDisplay = 5;
        const hex = _(['F0', ...(event.data || [])
            .map(x => x.toString(16))
            .map(x => _.padStart(x, 2, '0'))
            .map(x => x.toUpperCase())
        ]).takeRight(numBytesToDisplay);
        return (numBytesToDisplay < event.data.length ? 'F0 .. ' : 'F0 ') + hex.join(" ");
    }
    const paramToString = x => x !== undefined ? x.toString() : '';
    return `${paramToString(event.param1)} ${paramToString(event.param2)}`;
}

export function midiNumberToNoteName(number) {
    const names = ['c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a', 'a#', 'b'];
    const octavePostfixes = [",,,,,", ",,,,", ",,,", ",,", ",", "", "'", "''", "'''", "''''", "'''''"]
    const name = names[number % 12];
    const octave = octavePostfixes[Math.floor(number / 12)]
    return `${name}${octave}`;
}

export function midiNumberToNoteNameHtml(number) {
    const names = ['c', 'c-sharp', 'd', 'd-sharp', 'e', 'f', 'f-sharp', 'g', 'g-sharp', 'a', 'a-sharp', 'b'];
    const name = names[number % 12];
    const octave = Math.floor(number / 12);
    return `${name}-${octave}`;
}

export function getNumberOfTracks(midifile) {
    return midifile.header.getTracksCount();
}

export function getTracks(midifile) {
    const trackskWithName = [];
    for (const event of midifile.getEvents()) {
        const key = event.track || 0;
        if (!trackskWithName[key]) {
            trackskWithName[key] = "unknown";
        }
        if (event.type === MidiEvents.EVENT_META
            && event.subtype === MidiEvents.EVENT_META_TRACK_NAME) {
            trackskWithName[key] = eventDataToString(event);
        }
    }
    return trackskWithName;
}