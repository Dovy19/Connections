import BoxItem from "./BoxItem"
import {useState, useEffect} from "react";
import "./BoxItemGrid.css";
import groupChecker from "./groupChecker";
import Lives from "./Lives";
import shuffleArray from "./shuffleArray";
import GuessedCategory from "./GuessedCategory";
import "./Feedback.css";
import axios from "axios";
import Rules from "./Rules";


export default function BoxItemGrid() {
    const storedGameWon = localStorage.getItem("gameWon");
    const storedHealth = Number(localStorage.getItem("currentHealth"));
    const storedGuesses = localStorage.getItem("currentGuesses");
    const storedCorrectCategories = localStorage.getItem("correctCategories");
    const [showRules, setShowRules] = useState(true);
    const [puzzle, setPuzzle] = useState(null);
    const [error, setError] = useState(null);
    const [shuffledWords, setShuffledWords] = useState([]);
    const [selectedWords, setSelectedWords] = useState([]);
    const [health, setHealth] = useState(storedHealth ? parseInt(storedHealth, 10) : 4);
    const [gameOver, setGameOver] = useState(false);
    const [correctCategory, setCorrectCategory] = useState(null);
    const [correctGuesses, setCorrectGuesses] = useState([]);
    const [feedbackMessage, setFeedbackMessage] = useState("");
    const [showFeedback, setShowFeedback] = useState(false);
    const [submissionFeedback, setSubmissionFeedback] = useState(storedGuesses ? JSON.parse(storedGuesses) : []);
    const [animateSubmission, setAnimateSubmission] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [displayFeedback, setDisplayFeedback] = useState(true);
    const [gameWon, setGameWon] = useState(storedGameWon === "true");
    // Streak related state
    const [currentStreak, setCurrentStreak] = useState(parseInt(localStorage.getItem("currentStreak") || "0", 10));
    const [lastPlayedTime, setLastPlayedTime] = useState(parseInt(localStorage.getItem("lastPlayedTime") || "0", 10));
    
    useEffect(() => {
        const fetchPuzzle = async () => {
            const storedPuzzle = localStorage.getItem("currentPuzzle");
            const storedDate = localStorage.getItem("puzzleFetchedDate");
    
            // Get today's date string in UTC (e.g., "2025-03-09")
            const todayUTC = new Date().toISOString().split("T")[0];
    
            // If the puzzle was already fetched today, use the stored one
            if (storedPuzzle && storedDate === todayUTC) {
                setPuzzle(JSON.parse(storedPuzzle));
                return;
            }
    
            // Fetch new puzzle from the API
            try {
                const response = await axios.get("https://connectionsapi.onrender.com/api/puzzle/next");
                setPuzzle(response.data);
    
                // Store puzzle and today's date
                localStorage.setItem("currentPuzzle", JSON.stringify(response.data));
                localStorage.setItem("puzzleFetchedDate", todayUTC);
                localStorage.setItem("currentHealth", "4");
                localStorage.removeItem("currentGuesses");
                localStorage.removeItem("gameWon");
                localStorage.removeItem("correctCategories");
    
                setSubmissionFeedback([]);
                setHealth(4);
                setGameWon(false);
                setCorrectGuesses([]);
    
                // Reset streak if inactive for more than 50 hours
                const currentTime = Date.now();
                if (lastPlayedTime > 0 && currentTime - lastPlayedTime > 50 * 60 * 60 * 1000) {
                    setCurrentStreak(0);
                    localStorage.setItem("currentStreak", "0");
                }
    
                // Update last played time
                setLastPlayedTime(currentTime);
                localStorage.setItem("lastPlayedTime", currentTime.toString());
            } catch (err) {
                setError(err.message);
            }
        };
    
        fetchPuzzle();
    }, []);
    

    useEffect(() => {
        if(puzzle) {
            const groups = {
                medium: [
                    { category: puzzle.firstCategory.categoryName, words: puzzle.firstCategory.categoryItems },
                    { category: puzzle.secondCategory.categoryName, words: puzzle.secondCategory.categoryItems },
                    { category: puzzle.thirdCategory.categoryName, words: puzzle.thirdCategory.categoryItems },
                    { category: puzzle.fourthCategory.categoryName, words: puzzle.fourthCategory.categoryItems },
                ],
            };

            if (storedHealth === 0 || storedGameWon === "true") {
                setGameOver(true);
                setDisplayFeedback(true);
                setShowRules(false);
                
                // Set correct guesses based on puzzle data if game was won
                if (storedGameWon === "true") {
                    setGameWon(true);
                    setCorrectGuesses(groups.medium);
                    setShuffledWords([]);
                } else {
                    // If game over but not won, still load correct guesses
                    if (storedCorrectCategories) {
                        const savedCategories = JSON.parse(storedCorrectCategories);
                        const savedGuesses = savedCategories.map(categoryName => {
                            return groups.medium.find(group => group.category === categoryName);
                        }).filter(Boolean);
                        
                        setCorrectGuesses(savedGuesses);

                        // Set remaining words for the board
                        const allWords = groups.medium.map(group => group.words).flat();
                        const correctWords = savedGuesses.map(group => group.words).flat();
                        const remainingWords = allWords.filter(word => !correctWords.includes(word));
                        setShuffledWords(shuffleArray([...remainingWords]));
                    }
                }
            } else {
                // Game in progress
                if (storedCorrectCategories) {
                    const savedCategories = JSON.parse(storedCorrectCategories);
                    const savedGuesses = savedCategories.map(categoryName => {
                        return groups.medium.find(group => group.category === categoryName);
                    }).filter(Boolean);
                    
                    setCorrectGuesses(savedGuesses);

                    // Set remaining words for the board
                    const allWords = groups.medium.map(group => group.words).flat();
                    const correctWords = savedGuesses.map(group => group.words).flat();
                    const remainingWords = allWords.filter(word => !correctWords.includes(word));
                    setShuffledWords(shuffleArray([...remainingWords]));
                } else {
                    resetGame();
                }
            }
        }
    }, [puzzle]);



    if (!puzzle) return <div>Fetching new puzzle...</div>
    if (error) return <div>Error: {error}</div>

    const groups = {
        medium: [
            { category: puzzle.firstCategory.categoryName, words: puzzle.firstCategory.categoryItems },
            { category: puzzle.secondCategory.categoryName, words: puzzle.secondCategory.categoryItems },
            { category: puzzle.thirdCategory.categoryName, words: puzzle.thirdCategory.categoryItems },
            { category: puzzle.fourthCategory.categoryName, words: puzzle.fourthCategory.categoryItems },
        ],
    }

    const categoryIndexMap = {
        [groups.medium[0].category]: 0,
        [groups.medium[1].category]: 1,
        [groups.medium[2].category]: 2,
        [groups.medium[3].category]: 3,
    };

    const categoryColors = [
        "linear-gradient(180deg, rgba(212,205,207,1) -50%, rgba(0,212,255,1) 100%)",  
        "linear-gradient(180deg, rgba(177,169,171,1) -50%, rgba(35,191,77,1) 100%)",  
        "linear-gradient(180deg, rgba(126,121,122,1) -50%, rgba(256,220,108,1) 100%)",   
        "linear-gradient(180deg, rgba(90,85,86,1) -50%, rgba(206,20,61,1) 100%)",   
        "#8A2BE2"    
    ];




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
        const groupWords = groups.medium.map(group => group.words).flat();
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

    // Function to update streak
    const updateStreak = (won) => {
        // Update last played time regardless of win/loss
        const currentTime = Date.now();
        setLastPlayedTime(currentTime);
        localStorage.setItem("lastPlayedTime", currentTime.toString());
        
        if (won) {
            // Increment streak counter when user wins
            const newStreak = currentStreak + 1;
            setCurrentStreak(newStreak);
            localStorage.setItem("currentStreak", newStreak.toString());
        }
    };

    const handleSubmit = () => {
        if (selectedWords.length === 4 && !isSubmitting) {
            setIsSubmitting(true);
            const matchedGroup = groups.medium.find(group =>
                group.words.every(word => selectedWords.includes(word))
            );
            setAnimateSubmission(true);
            endAnimation();
            const feedback = selectedWords.map(word => {
                const category = Object.keys(categoryIndexMap).find(cat =>
                    groups.medium.some(group => 
                        group.category === cat && group.words.includes(word)
                    )
                );
                const color = category ? categoryColors[categoryIndexMap[category]] : "#ccc"; // Default color if not found
                return color;
            });
    
            // Store feedback attempt
            setSubmissionFeedback(prevFeedback => {
                const updatedFeedback = [...prevFeedback, feedback];
                localStorage.setItem("currentGuesses", JSON.stringify(updatedFeedback));
                return updatedFeedback;
            });

            if (matchedGroup) {
                setTimeout(() => {
                    setCorrectCategory(matchedGroup.category);
                    setShuffledWords(prevWords => prevWords.filter(word => !matchedGroup.words.includes(word)));
                    setFeedbackMessage("Correct!");
                    setShowFeedback(true);
                    
                    const updatedCorrectGuesses = [
                        ...correctGuesses,
                        { category: matchedGroup.category, words: matchedGroup.words }
                    ];
                    
                    setCorrectGuesses(updatedCorrectGuesses);
                    
                    // Store correct categories in localStorage
                    const categoryNames = updatedCorrectGuesses.map(guess => guess.category);
                    localStorage.setItem("correctCategories", JSON.stringify(categoryNames));
                    
                    // Check if all groups have been guessed
                    if (updatedCorrectGuesses.length === groups.medium.length) {
                        setGameWon(true);
                        localStorage.setItem("gameWon", "true");
                        setGameOver(true);
                        
                        // Update streak when player wins
                        updateStreak(true);
                    }
                }, 1000);
                
                setTimeout(() => {
                    setShowFeedback(false);
                }, 4000);
            } else {
                setFeedbackMessage("Incorrect!");
                setTimeout(() => {
                    setShowFeedback(true);
                    setHealth(prevHealth => {
                        const newHealth = prevHealth - 1;
                        localStorage.setItem("currentHealth", newHealth);
                        if (newHealth <= 0) {
                            setGameOver(true);
                            // Don't increment streak on loss, but don't reset either
                            // We just update the last played time
                            updateStreak(false);
                        }
                        return newHealth;
                    });
                }, 1000);
                
                setTimeout(() => {
                    setShowFeedback(false);
                }, 2000);
            }
            
            setTimeout(() => {
                setIsSubmitting(false);
            }, 2000);
        }
    };

    const resetGame = () => {
        initializeWords();
        setSelectedWords([]);
        setGameOver(false);
        setCorrectCategory(null);
        setCorrectGuesses([]);
        setIsSubmitting(false);
        setDisplayFeedback(true);
    }


    const handleShuffle = () => {
        setShuffledWords(() => shuffleArray([...shuffledWords]));
    }

    const handleCloseRules = () => {
        setShowRules(false);
    }

    // Function to format streak display
    const formatStreakDisplay = () => {
        if (currentStreak === 0) return "No streak yet";
        if (currentStreak === 1) return "1 day streak";
        return `${currentStreak} day streak`;
    };

    return (
        <div className="GameContainer">
            {showRules && <Rules onClose={handleCloseRules} />}
            
            {/* Streak Display */}
            <div className="streak-display" style={{
                background: "#f0f0f0", 
                padding: "8px 16px", 
                borderRadius: "20px", 
                fontWeight: "bold",
                display: "inline-block",
                margin: "10px 0",
                fontSize: "0.7rem",
                color: currentStreak > 0 ? "black" : "#666"
            }}>
                🔥 {formatStreakDisplay()}
            </div>
            
            {correctGuesses.map((guess, index) => {
                const fixedIndex = categoryIndexMap[guess.category];
                return (
                    <GuessedCategory 
                        key={index} 
                        category={guess.category} 
                        words={guess.words} 
                        color={categoryColors[fixedIndex]} 
                    />
                );
            })}

            {showFeedback && (
                <div className="feedback-box">
                    {feedbackMessage}
                </div>
            )}

            {gameOver && !gameWon && (
                groups.medium
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
                <div className="BoxItemGrid" key="medium">
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

            <p style={{fontWeight: 700}}>{gameOver && !gameWon ? "You lose" : gameOver && gameWon ? "You win!" : ""}</p>

            {!gameOver && puzzle && <div className="LivesDiv">
                <p>Lives remaining: </p>
                {[...Array(health)].map((_, index) => (
                    <Lives key={index} />
                ))}
                <div className="author-div">
                <p className="author-p">Submited by: {puzzle.author}</p>
                </div>
            </div>}
            
            {gameOver && shuffledWords.length !== 0 ? (
                ""
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
            )}

            {gameOver ? "" : shuffledWords.length !== 0 ? <button className="shuffleButton" onClick={handleShuffle}>Shuffle</button> : ""}
            {gameOver ? "" : shuffledWords.length !== 0 ? <button className="deselectButton" onClick={handleDeselect}>Deselect All</button> : ""}
            <p>Want to create a puzzle and be featured in the next game? <a href="https://connectionsapi-1.onrender.com/" target="_blank">Click here!</a> </p>
            
            {(gameOver || shuffledWords.length === 0) && (
                <div className={`feedback-summary ${!displayFeedback ? "feedback-hidden" : ""}`}>
                    <button className="feedback-button" onClick={handleDisplayFeedback}>&times;</button>
                    <h2>{gameWon ? "Congratulations!" : "Better Luck Next Time!"}</h2>
                    <p>{gameWon ? 
                        `You've earned a ${currentStreak > 1 ? `${currentStreak}-day` : "new"} streak! Come back tomorrow to continue it.` : 
                        "Don't worry, your streak is safe! You have 50 hours to solve the next puzzle."}
                    </p>
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
                                return null; 
                            })}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}