import React, {Component} from 'react'
import Checkbox from 'material-ui/Checkbox'
import SoundOn from 'material-ui/svg-icons/av/volume-up'
import SoundOff from 'material-ui/svg-icons/av/volume-off'

export default class GameSoundController extends Component {

    state = {
        musicVolume: 75,
        soundOn: true,
        powAudio: {}
    }

    constructor() {
        super()
        const audioElement = document.createElement('audio')
        audioElement.setAttribute('src', 'pow.wav')
        this.state.powAudio = audioElement
    }

    setVolume = (value) => {
        // .volume = val / 100;
        // console.log('After: ' + player.volume);
    }

    playPowSound() {
        if(this.state.soundOn) {
            this.state.powAudio.play()
        }
    }

    componentWillUnmount = () => {
        this.state.powAudio.pause()
    }

    render() {
        return(<div>
            <Checkbox
                checkedIcon={<SoundOff/>}
                uncheckedIcon={<SoundOn/>}
                onClick={()=> {this.setState({soundOn: !this.state.soundOn})}}
            />
        </div>)
    }

}