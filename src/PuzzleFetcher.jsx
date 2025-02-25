import { useState, useEffect } from "react"
import axios from "axios";

export default function PuzzleFetcher() {
    const [puzzle, setPuzzle] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPuzzle = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/puzzle/next");
                setPuzzle(response.data);
                console.log("Fetched puzzle: ", response.data)
            } catch (err) {
                setError(err.message);
            }
        };
        fetchPuzzle();
    }, [])

    if (error) return <div>Error {error}</div>
    if (!puzzle) return <div>Loading...</div>

    return (
        <>
        </>
    )
}