export class CheckboxFilterGroup {
    selected = {};
    onSelectionChanged = () => {};
    createElement(values) {
        const div = document.createElement("div");
        div.className = "chkbx-grp";
        for(const value of values) {
            const defaultSelected = true;
            this.selected[value] = defaultSelected;
            const grp = document.createElement('div');
            const label = document.createElement("label");
            grp.appendChild(label);
            label.innerText = value;
            const checkbox = document.createElement("input");
            checkbox.checked = defaultSelected;
            checkbox.onclick = () => {
                this.selected[value] = checkbox.checked;
                setTimeout(this.onSelectionChanged.bind(this, value, checkbox.checked));
            };
            checkbox.type = "checkbox";
            checkbox.name = value;
            grp.appendChild(checkbox);
            div.appendChild(grp);
        }
        return div;
    }
}