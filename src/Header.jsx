import "./Header.css"
export default function Header() {
    const date = new Date("November 9, 2024");
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
    return (
        <header className="header">
            <h1 className="header-comp">{month} {day} - {year}</h1>
            <h2 className="header-comp">Connections</h2>
        </header>
    )
}