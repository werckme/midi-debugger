export class AView {
    element = null;
    /**
     * [ // tracks
     *      [ // events
     *          {element},
     *          ...
     *      ]
     * ]
     */
    eventToElementMap = [];
    onUpdated = null;
    clear() {
        this.element.innerHTML = '';
    }
    visitTrack(trackIndex) {
        this.eventToElementMap[trackIndex] = this.eventToElementMap[trackIndex] || [];
    }
    visitEventElement(trackIndex, eventElement) {
        this.eventToElementMap[trackIndex].push(eventElement||null);
    }
    beginRender() {
        this.eventToElementMap = [];
    }
    endRender() {
        if(this.onUpdated) {
            this.onUpdated();
        }
    }
    getEventLabelHtmlText(trackIndex, eventIndex) {
        const element = (this.eventToElementMap[trackIndex]||[])[eventIndex];
        if (!element) {
            return null;
        }
        return this.getEventLabelImpl(element);
    }
    updateEventLabelHtmlText(trackIndex, eventIndex, htmlText) {
        const element = (this.eventToElementMap[trackIndex]||[])[eventIndex];
        if (!element) {
            return;
        }
        this.updateEventLabelImpl(element, htmlText);
    }
    /**
     * abstract
     */
    updateEventLabelImpl(element, htmlText) {}
    /**
     * abstract
     */    
    getEventLabelImpl(element) {}
}