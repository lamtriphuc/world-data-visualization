import React, { useEffect } from 'react'
import { getTravelTracker } from '../services/auth.service'

const TravelTracker = () => {

    useEffect(() => {
        const fetchTravelTracker = async () => {
            try {
                const response = await getTravelTracker();
                console.log(response)
            } catch (error) {
                console.log("Travel tracker: ", error)
            }
        }


        fetchTravelTracker();
    }, [])

    return (
        <div>TravelTracker</div>
    )
}

export default TravelTracker