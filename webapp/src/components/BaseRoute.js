import React, {Component} from 'react'
import MusicController from './MusicController'
import ee from '../utils/eventEmitter'

export default class BaseRoute extends Component {

    state = {
        musicOn: false,
        volume: 0.05,
        soundOn: false
    }

    onVolumeChange = (volume) => {
        this.setState({volume})
        this.refs.music_audio.volume = volume
    }

    onToggleMusic = () => {
        this.setState({musicOn: !this.state.musicOn})
        this.state.musicOn ? this.refs.music_audio.pause() : this.refs.music_audio.play()
    }

    onToggleSound = () => {
        this.setState({soundOn: !this.state.soundOn})
    }

    componentDidMount() {
        //this.refs.music_audio.play()
        this.refs.music_audio.volume = this.state.volume
        ee.on('BALL_HIT', this.playPow)
    }

    playPow = () => {
        if(this.state.soundOn) this.refs.sound_audio.play()
    }

    render() {
        return <div>
            <audio ref="music_audio" src="http://trace.dnbradio.com/dnbradio_main.mp3"/>
            <audio ref="sound_audio" src="../pow.wav"/>
            {/*<this.props.children.type socket={this.socket} {...this.props.children.props}>*/}
            <this.props.children.type {...this.props.children.props}>
                <MusicController musicOn={this.state.musicOn}
                                 volume={this.state.volume}
                                 soundOn={this.state.soundOn}
                                 onToggleMusic={this.onToggleMusic}
                                 onChangeVolume={this.onVolumeChange}
                                 onToggleSound={this.onToggleSound}
                />
            </this.props.children.type>
        </div>
    }
}