import React, {Component} from 'react'
import Checkbox from 'material-ui/Checkbox'
import MusicOn from 'material-ui/svg-icons/av/play-arrow'
import MusicOff from 'material-ui/svg-icons/av/pause'
import Slider from 'material-ui/Slider'
import SoundController from './GameSoundController'

export default class MusicController extends Component {

    state = {
       musicOn : true
    }

    static propTypes = {

    }

    constructor() {
        super()
    }

    handleVolumeChange = (e, v) => {
        this.refs.music_audio.volume = v
    }

    toggle() {
        this.state.musicOn ? this.refs.music_audio.pause() : this.refs.music_audio.play()
        this.setState({musicOn: !this.state.musicOn})
    }

    componentDidMount() {
        this.refs.music_audio.setAttribute('src', 'http://trace.dnbradio.com/dnbradio_main.mp3')
        this.refs.music_audio.play()
        this.refs.music_audio.volume = 0.75
    }

    playPowSound() {
        console.log('HHHHHHHHHHHHHHASDHHSDAHDHS')
        this.refs.sounds.playPowSound()
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
                <Slider defaultValue={0.75}
                    onChange={this.handleVolumeChange}
                    sliderStyle={{margin: '0'}}
                />
            </div>
            <div className="col-sm-5 col-xs-5 col-md-5">
                <SoundController ref="sounds"/>
            </div>
            <audio ref="music_audio"/>
        </div>)
    }

}


