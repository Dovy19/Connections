import BoxItem from "./BoxItem"
import {useState, useEffect} from "react";
import "./BoxItemGrid.css";
import groupChecker from "./groupChecker";
import "./DifficultyButtons.css"
import Lives from "./Lives";
import shuffleArray from "./shuffleArray";
import GuessedCategory from "./GuessedCategory";
import "./Feedback.css";


export default function BoxItemGrid() {
    // const [words] = useState([
    //     "cat", "dog", "giraffe", "rhino",
    //     "apple", "orange", "banana", "lemon",
    //     "car", "bus", "train", "bicycle",
    //     "blue", "red", "green", "yellow",
    //     "pen", "pencil", "marker", "eraser"
    // ]);

    const groups = {
        easy: [
            { category: "Animals", words: ["cat", "dog", "giraffe", "rhino"] },
            { category: "Fruits", words: ["apple", "orange", "banana", "lemon"] },
            { category: "Vehicles", words: ["car", "bus", "train", "bicycle"] },
        ],
        medium: [
            { category: "Organizational Structures", words: ["League", "Division", "Conference", "Association"] },
            { category: "Sports Area", words: ["Court", "Field", "Pitch", "Arena"] },
            { category: "Basketball Court Zones", words: ["Elbow", "Wing", "Key", "Restricted Area"] },
            { category: "Courtroom Elements", words: ["Guilty", "Bailiff", "Judge", "Trial"] },
        ],
        hard: [
            { category: "Animals", words: ["cat", "dog", "giraffe", "rhino"] },
            { category: "Fruits", words: ["apple", "orange", "banana", "lemon"] },
            { category: "Vehicles", words: ["car", "bus", "train", "bicycle"] },
            { category: "Colors", words: ["blue", "red", "green", "yellow"] },
            { category: "Stationery", words: ["pen", "pencil", "marker", "eraser"] },
        ],
    }

    const categoryIndexMap = {
        "Organizational Structures": 0,
        "Sports Area": 1,
        "Basketball Court Zones": 2,
        "Courtroom Elements": 3,
        "Stationery": 4,
    };

    const categoryColors = [
        "#D4CDCF",   // Permanent Green #adf7d1
        "#B1A9AB",   // Viridian #95e8d7
        "#7E797A",   // Cerulean Blue #7dace4
        "#5A5556",   // Ultramarine Violet #8971d0
        "#8A2BE2"    // Permanent Violet
    ];

    const [difficulty, setDifficulty] = useState("medium")
    const groupWords = groups[difficulty].map(group => group.words).flat();
    const [shuffledWords, setShuffledWords] = useState([]);
    const [selectedWords, setSelectedWords] = useState([]);
    const [health, setHealth] = useState(4);
    const [gameOver, setGameOver] = useState(false);
    const [correctCategory, setCorrectCategory] = useState(null);
    const [correctGuesses, setCorrectGuesses] = useState([]);
    const allCategories = groups[difficulty];
    const [feedbackMessage, setFeedbackMessage] = useState("");
    const [showFeedback, setShowFeedback] = useState(false);
    const [submissionFeedback, setSubmissionFeedback] = useState([]);
    const [animateSubmission, setAnimateSubmission] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [displayFeedback, setDisplayFeedback] = useState(true);
    // const originalWords = [...initialWords];


    const handleDisplayFeedback = () => {
        setDisplayFeedback(false);
    }

    const handleSelectWord = (word) => {
        if (selectedWords.includes(word)) {
            setSelectedWords(selectedWords.filter(selected => selected !== word));
        } else {
            if (selectedWords.length < 4) {
                setSelectedWords([...selectedWords, word]);
            }
        }
    }

    const handleDeselect = () => {
        setSelectedWords([]);
    }

    const initializeWords = () => {
        const groupWords = groups[difficulty].map(group => group.words).flat();
        setShuffledWords(shuffleArray([...groupWords])); // Shuffle on initialization
        setCorrectGuesses([]);
        setGameOver(false);
    };

    const endAnimation = () => {
        setTimeout(() => {
            setAnimateSubmission(false);
            setSelectedWords([]);
        }, 1000);
    };

    const handleSubmit = () => {
        if (selectedWords.length === 4 && !isSubmitting) {
            setIsSubmitting(true);
            const matchedGroup = groups[difficulty].find(group =>
                group.words.every(word => selectedWords.includes(word))
            );
            setAnimateSubmission(true);
            endAnimation();
            const feedback = selectedWords.map(word => {
                const category = Object.keys(categoryIndexMap).find(cat =>
                    groups[difficulty].some(group => 
                        group.category === cat && group.words.includes(word)
                    )
                );
                const color = category ? categoryColors[categoryIndexMap[category]] : "#ccc"; // Default color if not found
                return color ;
            });
    
            // Store feedback attempt
            setSubmissionFeedback(prevFeedback => [...prevFeedback, feedback]);

            if (matchedGroup) {
                setTimeout(() => {
                    setCorrectCategory(matchedGroup.category);
                setShuffledWords(prevWords => prevWords.filter(word => !matchedGroup.words.includes(word)));
                setFeedbackMessage("Correct!");
                setShowFeedback(true);
                setCorrectGuesses(prevGuesses => [
                    ...prevGuesses,
                    { category: matchedGroup.category, words: matchedGroup.words }
                ]);
                }, 1000)
                setTimeout(() => {
                    setShowFeedback(false);
                }, 4000)
            } else {
                setFeedbackMessage("Incorrect!");
                setTimeout(() => {
                    setShowFeedback(true);
                    setHealth(prevHealth => {
                        const newHealth = prevHealth - 1;
                        if (newHealth <= 0) {
                            setGameOver(true);
                        }
                        return newHealth;
                    });
                }, 1000)
                setTimeout(() => {
                    setShowFeedback(false);
                }, 2000)
            }
            setTimeout(() => {
                setIsSubmitting(false)
            }, 2000)
            // Reset selected words after submission
        }
    };

    const resetGame = () => {
        initializeWords();
        setSelectedWords([]);
        setHealth(4);
        setGameOver(false);
        setCorrectCategory(null);
        setCorrectGuesses([]);
        setSubmissionFeedback([]);
        setIsSubmitting(false);
        setDisplayFeedback(true);
    }

    const difficultySelector = (e) => {
       const newDifficulty = e.target.value;
       setDifficulty(newDifficulty);
       setSelectedWords([]);
       setHealth(4);
       setGameOver(false);
       setCorrectGuesses([]);
       initializeWords();
       setSubmissionFeedback([]);
       setIsSubmitting(false);
       setDisplayFeedback(true);
    }


    useEffect(() => {
        initializeWords();
    }, [difficulty]);

    const handleShuffle = () => {
        setShuffledWords(() => shuffleArray([...shuffledWords]));
    }

    return (
            <div className="GameContainer">
                {!gameOver && (
                <div className="DifficultyButtons">
        {/* <button 
            value="easy" 
            onClick={difficultySelector} 
            className={difficulty === "easy" ? "active" : ""}
            >
            Easy
        </button>
        <button 
            value="medium" 
            onClick={difficultySelector} 
            className={difficulty === "medium" ? "active" : ""}
        >
            Medium
        </button>
        <button 
            value="hard" 
            onClick={difficultySelector} 
            className={difficulty === "hard" ? "active" : ""}
        >
            Hard
        </button> */}
    </div>
    )}
            {correctGuesses.map((guess, index) => {
                const fixedIndex = categoryIndexMap[guess.category];
                return (
                <GuessedCategory 
                key={index} 
                category={guess.category} 
                words={guess.words} 
                color={categoryColors[fixedIndex]} />
                );
            })}

            {showFeedback && (
                <div className="feedback-box">
                    {feedbackMessage}
                    </div>
            )}

            {gameOver && (
                allCategories
                    .filter(group => !correctGuesses.some(guess => guess.category === group.category))
                    .map((group, index) => (
                        <GuessedCategory 
                            key={`gameover-${index}`} 
                            category={group.category} 
                            words={group.words} 
                            color={categoryColors[categoryIndexMap[group.category]]} 
                        />
                    ))
            )}
           
           {!gameOver && (
            <div className="BoxItemGrid" key={difficulty}>
                {shuffledWords.map((word, i) => {
                return <BoxItem 
                key={i} 
                word={word} 
                onSelect={handleSelectWord} 
                isSelected={selectedWords.includes(word)}
                disabled={gameOver}
                animateSubmission={animateSubmission && selectedWords.includes(word)}
                 />
                })}
            </div>
            )}

            <p style={{fontWeight: 700}}>{gameOver && "You lose"}</p>

            {!gameOver && <div className="LivesDiv">
                <p>Lives remaining: </p>
                {[...Array(health)].map((_, index) => (
                    <Lives key={index} />
                ))}
            </div> }
            {shuffledWords.length === 0 && <button onClick={resetGame}>Play Again!</button>}
            {gameOver && shuffledWords.length !== 0 ? (
                <button onClick={resetGame}>Try again?</button>
                ) : (
                    shuffledWords.length !== 0 && (
                        <button
                            className={`submitButton ${selectedWords.length === 4 ? 'active' : ''}`}
                            disabled={selectedWords.length !== 4 || isSubmitting}
                            onClick={handleSubmit}
                        >
                            Submit
            </button>
        )
    )
}

            {gameOver ? "" : shuffledWords.length !== 0 ? <button className="shuffleButton" onClick={handleShuffle}>Shuffle</button> : ""}
            {gameOver ? "" : shuffledWords.length !== 0 ? <button className="deselectButton" onClick={handleDeselect}>Deselect All</button> : ""}
            
            {(gameOver || shuffledWords.length === 0) && (
            <div className={`feedback-summary ${!displayFeedback ? "feedback-hidden" : ""} `}>
                <button className="feedback-button" onClick={handleDisplayFeedback}>&times;</button>
                <h2>{health ? "Congratulations!" : "Better Luck Next Time!"}</h2>
                <h3>Your Guesses:</h3>
                {submissionFeedback.map((guessColors, index) => (
                    <div key={index} className="guess-row">
                        <span>Attempt {index + 1}:</span>
                        {guessColors.map((color, colorIndex) => (
                            <span
                                key={colorIndex}
                                className="color-box"
                                style={{
                                    display: "inline-block",
                                    width: "1.25em",
                                    height: "1.25em",
                                    backgroundColor: color,
                                    marginLeft: "0.25em",
                                    borderRadius: "0.25em"
                                }}
                            />
                        ))}
                    </div>
                ))}
            </div>
        )}

        </div>
    )
}