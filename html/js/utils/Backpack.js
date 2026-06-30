import { GAME_CONFIG } from '../config.js';

export default class Backpack {
    constructor() {
        this.items = {};
        this.maxSlots = 8;
        this.onUpdate = null;
        this.init();
    }
    
    init() {
        Object.keys(GAME_CONFIG.MATERIALS).forEach(key => {
            this.items[key] = 0;
        });
        this.updateUI();
    }
    
    addItem(materialId, count = 1) {
        if (this.items.hasOwnProperty(materialId)) {
            this.items[materialId] += count;
            this.updateUI();
            return true;
        }
        return false;
    }
    
    removeItem(materialId, count = 1) {
        if (this.items.hasOwnProperty(materialId) && this.items[materialId] >= count) {
            this.items[materialId] -= count;
            this.updateUI();
            return true;
        }
        return false;
    }
    
    getItemCount(materialId) {
        return this.items[materialId] || 0;
    }
    
    hasItems(materialId, count) {
        return this.getItemCount(materialId) >= count;
    }
    
    updateUI() {
        const slots = document.querySelectorAll('.backpack-slot');
        const materialKeys = Object.keys(GAME_CONFIG.MATERIALS);
        
        slots.forEach((slot, index) => {
            if (index < materialKeys.length) {
                const key = materialKeys[index];
                const material = GAME_CONFIG.MATERIALS[key];
                const count = this.items[key];
                
                if (count > 0) {
                    slot.classList.add('filled');
                    slot.innerHTML = `
                        <span class="backpack-icon">${material.icon}</span>
                        <span class="backpack-name">${material.name}</span>
                        <span class="backpack-count">×${count}</span>
                    `;
                } else {
                    slot.classList.remove('filled');
                    slot.innerHTML = '';
                }
            }
        });
        
        if (this.onUpdate) {
            this.onUpdate();
        }
    }
    
    clear() {
        Object.keys(this.items).forEach(key => {
            this.items[key] = 0;
        });
        this.updateUI();
    }
}
