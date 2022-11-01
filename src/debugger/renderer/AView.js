import * as _ from 'lodash';

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

    getEventElement(trackIndex, eventIndex) {
        const element = (this.eventToElementMap[trackIndex]||[])[eventIndex];
        if (!element) {
            return null;
        }
        return element;
    }

    findEventIndices(element) {
        for(let trackIndex = 0; trackIndex < this.eventToElementMap.length; ++trackIndex) {
            const eventElements = this.eventToElementMap[trackIndex];
            if (!eventElements) {
                continue;
            }
            for(let eventIndex = 0; eventIndex < eventElements.length; ++eventIndex) {
                const elementToCheck = eventElements[eventIndex];
                if (element === elementToCheck) {
                    return {trackIndex, eventIndex};
                }
            }
        }
        return null;
    }
    
    /**
     * abstract
     */
    updateEventLabelImpl(element, htmlText) {}
    /**
     * abstract
     */    
    getEventLabelImpl(element) {}
    /**
     * abstract
     */    
    render(midifile) {}
    /**
     * abstract
     */    
    search() {}
    /**
     * abstract
     */    
    clearSearch() {}
}