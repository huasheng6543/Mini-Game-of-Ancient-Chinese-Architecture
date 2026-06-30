export default class DialogueManager {
    constructor() {
        this.modal = document.getElementById('dialogue-modal');
        this.speakerEl = document.getElementById('dialogue-speaker');
        this.textEl = document.getElementById('dialogue-text');
        this.dialogueQueue = [];
        this.currentIndex = 0;
        this.onComplete = null;
        this.isActive = false;
        
        this.setupEvents();
    }
    
    setupEvents() {
        this.modal.addEventListener('click', () => {
            if (this.isActive) {
                this.next();
            }
        });
    }
    
    startDialogue(dialogues, speaker, onComplete = null) {
        this.reset();
        this.dialogueQueue = dialogues;
        this.currentSpeaker = speaker;
        this.currentIndex = 0;
        this.onComplete = onComplete;
        this.isActive = true;
        this.show();
    }
    
    reset() {
        this.modal.classList.remove('active');
        this.isActive = false;
        this.onComplete = null;
    }
    
    show() {
        if (this.currentIndex < this.dialogueQueue.length) {
            const dialogue = this.dialogueQueue[this.currentIndex];
            this.speakerEl.textContent = this.currentSpeaker;
            this.textEl.textContent = dialogue;
            this.modal.classList.add('active');
        }
    }
    
    next() {
        this.currentIndex++;
        if (this.currentIndex < this.dialogueQueue.length) {
            this.show();
        } else {
            this.close();
        }
    }
    
    close() {
        this.modal.classList.remove('active');
        this.isActive = false;
        if (this.onComplete) {
            const callback = this.onComplete;
            this.onComplete = null;
            callback();
        }
    }
    
    isDialogueActive() {
        return this.isActive;
    }
}
