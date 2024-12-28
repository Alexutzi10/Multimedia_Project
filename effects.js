export class VideoEffects {

    constructor(videoElement, canvasElement) {
        this.video = videoElement;
        this.canvas = canvasElement;
        this.context = this.canvas.getContext('2d');
        this.currentEffect = 'normal';
    }

    applyEffect(effect) {
        this.currentEffect = effect;
        this.drawFrame();
    }


    //Green tint effect
    green_tint(data) {
        for (let i = 0; i < data.length; i = i+4) {
            data[i] = data[i] * 0.8;
            data[i+1] = data[i+1] * 1.2;
            data[i+2] = data[i+2] * 0.8; 
            data[i+1] = Math.min(255, data[i+1]);
        }
    }


    //Magenta tint effect
    magenta_tint(data) {
        for (let i = 0; i < data.length; i = i+4) {
            data[i] = data[i] * 1.2;   
            data[i+1] = data[i+1] * 0.8; 
            data[i+2] = data[i+2] * 1.2; 
            data[i] = Math.min(255, data[i]); 
            data[i+2] = Math.min(255, data[i+2]); 
        }
    }


    //Old paper effect
    old_paper(data) {
        for (let i = 0; i < data.length; i = i+4) {
            const avg = (data[i] + data[i+1] + data[i+2]) / 3;
            data[i] = Math.min(255, avg + 50);
            data[i+1] = Math.min(255, avg + 35);
            data[i+2] = Math.min(255, avg);

            const noise = (Math.random() - 0.5) * 25;
            data[i] = data[i] + noise;
            data[i+1] = data[i+1] + noise;
            data[i+2] = data[i+2] + noise;
        }
    }


    //Colder tint effect
    cold_tint(data) {
        for (let i = 0; i < data.length; i = i+4) {
            data[i] = data[i] * 0.8;    
            data[i+1] = data[i+1] * 0.9; 
            data[i+2] = data[i+2] * 1.2; 
            data[i+2] = Math.min(255, data[i+2]); 
        }
    }


    //Setting the effect for the video
    drawFrame() {
        this.context.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);

        const frame = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = frame.data;

        switch (this.currentEffect) {
            case 'green_tint':
                this.green_tint(data);
                break;
            case 'magenta_tint':
                this.magenta_tint(data);
                break;
            case 'old_paper':
                this.old_paper(data);
                break;
            case 'colder_tint':
                this.cold_tint(data);
                break;
            case 'normal':
            default:
                break;
        }

        this.context.putImageData(frame, 0, 0);

        requestAnimationFrame(() => this.drawFrame());
    }
}
