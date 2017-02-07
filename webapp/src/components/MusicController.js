import React, {Component} from 'react'
import Checkbox from 'material-ui/Checkbox'
import MusicOn from 'material-ui/svg-icons/av/play-arrow'
import MusicOff from 'material-ui/svg-icons/av/pause'
import SoundOn from 'material-ui/svg-icons/av/volume-up'
import SoundOff from 'material-ui/svg-icons/av/volume-off'
import Slider from 'material-ui/Slider'

const MusicController = (props) => {
    const handleVolumeChange = (e, volume) => {
        props.onChangeVolume(volume)
    }
    
    return (<div className="row">
        <div className="col-sm-2 col-xs-2 col-md-2">
            <Checkbox
                checked={props.musicOn}
                checkedIcon={<MusicOff/>}
                uncheckedIcon={<MusicOn/>}
                onClick={props.onToggleMusic}
            />
        </div>
        <div className="col-md-5 col-sm-5 col-xs-5" style={{marginTop: '5px'}}>
            <Slider
                disabled={!props.musicOn}
                value={props.volume}
                onChange={handleVolumeChange}
                sliderStyle={{margin: '0'}}
            />
        </div>
        <div className="col-sm-5 col-xs-5 col-md-5">
            <Checkbox
                checked={props.soundOn}
                checkedIcon={<SoundOn/>}
                uncheckedIcon={<SoundOff/>}
                onClick={props.onToggleSound}
            />
        </div>
    </div>)
}

MusicController.propTypes = {
    musicOn: React.PropTypes.bool.isRequired,
    volume: React.PropTypes.number.isRequired,
    soundOn: React.PropTypes.bool.isRequired,
    onToggleMusic: React.PropTypes.func.isRequired,
    onChangeVolume: React.PropTypes.func.isRequired,
    onToggleSound: React.PropTypes.func.isRequired
}

export default MusicController