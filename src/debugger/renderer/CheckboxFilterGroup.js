export class CheckboxFilterGroup {
    selected = {};
    onSelectionChanged = () => {};
    createElement(checkboxItems) {
        const div = document.createElement("div");
        div.className = "chkbx-grp";
        for(const item of checkboxItems) {
            const value = item.value;
            const name = item.name;
            const defaultSelected = true;
            this.selected[value] = defaultSelected;
            const grp = document.createElement('div');
            grp.classList.add(item.class_ || "");
            const label = document.createElement("label");
            label.innerText = name;
            const checkbox = document.createElement("input");
            checkbox.checked = defaultSelected;
            checkbox.onclick = () => {
                this.selected[value] = checkbox.checked;
                setTimeout(this.onSelectionChanged.bind(this, value, checkbox.checked));
            };
            checkbox.type = "checkbox";
            checkbox.name = value;
            grp.appendChild(checkbox);
            grp.appendChild(label);
            div.appendChild(grp);
        }
        return div;
    }
}