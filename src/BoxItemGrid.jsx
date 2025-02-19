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


    const groups = {
        easy: [
            { category: "Animals", words: ["cat", "dog", "giraffe", "rhino"] },
            { category: "Fruits", words: ["apple", "orange", "banana", "lemon"] },
            { category: "Vehicles", words: ["car", "bus", "train", "bicycle"] },
        ],
        medium: [
            { category: "DC villains", words: ["Ra's al ghul", "Bane", "Penguin", "Lex Luthor"] },
            { category: "Moons In Solar System", words: ["Titan", "Callisto", "Io", "Ganymede"] },
            { category: "Greek mythology names", words: ["Apollo", "Selene", "Hyperion", "Pandora"] },
            { category: "Folklore Entities", words: ["Nine Tailed Fox", "Banshee", "Kraken", "Chupacabra"] },
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
        "DC villains": 0,
        "Moons In Solar System": 1,
        "Greek mythology names": 2,
        "Folklore Entities": 3,
        "Stationery": 4,
    };

    const categoryColors = [
        "linear-gradient(90deg, rgba(212,205,207,1) 70%, rgba(0,212,255,1) 100%)",  
        "linear-gradient(90deg, rgba(177,169,171,1) 70%, rgba(35,191,77,1) 100%)",  
        "linear-gradient(90deg, rgba(126,121,122,1) 70%, rgba(194,195,22,1) 100%)",   
        "linear-gradient(90deg, rgba(90,85,86,1) 70%, rgba(206,20,61,1) 100%)",   
        "#8A2BE2"    
    ];

    const [difficulty, setDifficulty] = useState("medium")
    // const groupWords = groups[difficulty].map(group => group.words).flat();
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
            <div className={`feedback-summary ${!displayFeedback ? "feedback-hidden" : ""}`}>
            <button className="feedback-button" onClick={handleDisplayFeedback}>&times;</button>
            <h2>{health ? "Congratulations!" : "Better Luck Next Time!"}</h2>
            <h3>Your Guesses:</h3>
            {submissionFeedback.map((guessColors, index) => (
                <div key={index} className="guess-row">
                    <span>Attempt {index + 1}:</span>
                    {guessColors.map((gradient, colorIndex) => {
                        // Extract color values from the linear-gradient string
                        const gradientColors = gradient.match(/rgba?\([^\)]+\)/g); // Match all rgba values in the gradient
                        if (gradientColors && gradientColors.length > 1) {
                            // If there are at least 2 colors, take the second one
                            const secondColor = gradientColors[1];
                            return (
                                <span
                                    key={colorIndex}
                                    className="color-box"
                                    style={{
                                        display: "inline-block",
                                        width: "1.25em",
                                        height: "1.25em",
                                        background: secondColor,
                                        marginLeft: "0.25em",
                                        borderRadius: "0.25em"
                                    }}
                                />
                            );
                        }
                        return null; // Return null if no second color is found
                    })}
                </div>
            ))}
        </div>
        
        )}

        </div>
    )
}