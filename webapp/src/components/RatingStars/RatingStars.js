//@flow
import React from 'react'
import Star from 'material-ui/svg-icons/toggle/star'
import StarHalf from 'material-ui/svg-icons/toggle/star-half'
import StarBorder from 'material-ui/svg-icons/toggle/star-border'

export default function({rating, size}: {rating: number, size: number}){
    const numberOfStars: number = 5
    const interval: number = 1 / numberOfStars
    const starStyle = {
        width: `${size}px`,
        height: `${size}px`
    }
    return (rating >= 0 && rating <= 1) ?
        <div style={{}}>
        {
            Array.from(new Array(numberOfStars).keys())
                .map((i: number) => {
                    const min = round2(i * interval)
                    const max = round2((i + 1) * interval)
                    if(rating <= min)
                        return <StarBorder key={i} style={starStyle}/>
                    else if(rating >= max)
                        return <Star key={i} style={starStyle}/>
                    else
                        return <StarHalf key={i} style={starStyle}/>
                })
        }
        </div> : null
}

function round2(n: number): number {
    return parseFloat(n.toFixed(2))
}