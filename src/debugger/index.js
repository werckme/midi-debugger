import * as MidiFileModule from "midifile";
import { ListView } from "./renderer/ListView";
const MidiFile = MidiFileModule.default;

export class WmMidiFileDebugger {
    midifile = null;
    views = [];
    setMidiFile(arrayBuffer) {
        this.midifile = new MidiFile(arrayBuffer);
    }

    addListView(element) {
        const listView = new ListView(element);
        this.views.push(listView);
    }

    update() {
        for(const view of this.views) {
            view.update(this.midifile);
        }
    }
}