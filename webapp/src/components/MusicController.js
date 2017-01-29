import React, {Component} from 'react'
import Checkbox from 'material-ui/Checkbox'
import MusicOn from 'material-ui/svg-icons/av/play-arrow'
import MusicOff from 'material-ui/svg-icons/av/pause'
import SoundOn from 'material-ui/svg-icons/av/volume-up'
import SoundOff from 'material-ui/svg-icons/av/volume-off'
import Slider from 'material-ui/Slider'

import ee from '../utils/eventEmitter'

export default class MusicController extends Component {

    state = {
       musicOn : true,
       soundOn: true,
       volume: 0.15
    }

    static propTypes = {

    }

    constructor() {
        super()
    }

    handleVolumeChange = (e, volume) => {
        this.refs.music_audio.volume = volume
        this.setState({volume})
    }

    toggle() {
        this.state.musicOn ? this.refs.music_audio.pause() : this.refs.music_audio.play()
        this.setState({musicOn: !this.state.musicOn})
    }

    componentDidMount() {
        this.refs.music_audio.play()
        this.refs.music_audio.volume = this.state.volume
        ee.on('BALL HIT', () => this.playPowSound())
    }

    playPowSound() {
        if(this.state.soundOn) this.refs.sound_audio.play()
    }

    render() {
        return(<div className="row">
            <div className="col-sm-2 col-xs-2 col-md-2">
                <Checkbox checkedIcon={<MusicOn/>}
                    uncheckedIcon={<MusicOff/>}
                    onClick={()=> {this.toggle()}}
                />
            </div>
            <div className="col-md-5 col-sm-5 col-xs-5" style={{marginTop: '5px'}}>
                <Slider
                    disabled={!this.state.musicOn}
                    value={this.state.volume}
                    onChange={this.handleVolumeChange}
                    sliderStyle={{margin: '0'}}
                />
            </div>
            <div className="col-sm-5 col-xs-5 col-md-5">
                <Checkbox
                    checkedIcon={<SoundOff/>}
                    uncheckedIcon={<SoundOn/>}
                    onClick={()=> {this.setState({soundOn: !this.state.soundOn})}}
                />
            </div>
            <audio ref="music_audio" src="http://trace.dnbradio.com/dnbradio_main.mp3"/>
            <audio ref="sound_audio" src="../pow.wav"/>
        </div>)
    }

}


