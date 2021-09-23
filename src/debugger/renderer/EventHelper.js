import * as MidiEvents from 'midievents';

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
        switch(event.subtype) {
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
}

export function eventDataToString(event) {
    if (event.type === MidiEvents.EVENT_META 
        && (   event.subtype === MidiEvents.EVENT_META_TEXT
            || event.subtype === MidiEvents.EVENT_META_COPYRIGHT_NOTICE
            || event.subtype === MidiEvents.EVENT_META_TRACK_NAME
            || event.subtype === MidiEvents.EVENT_META_INSTRUMENT_NAME
            || event.subtype === MidiEvents.EVENT_META_LYRICS
            || event.subtype === MidiEvents.EVENT_META_MARKER
            || event.subtype === MidiEvents.EVENT_META_CUE_POINT)) {
        return String.fromCharCode(...event.data);
    }
    return `${event.param1 || ''} ${event.param2 || ''}`;
}