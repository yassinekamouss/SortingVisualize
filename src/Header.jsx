
export default function Header() {

    return (
        <header className="bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 text-white py-7">
            <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
                {/* Logo ou icône  */}
                <div className="flex items-center mb-6 md:mb-0">
                    <h1 className="text-3xl font-semibold tracking-tight">🌀SortingVisualizer</h1>
                </div>

                {/* Titre dynamique avec une animation  */}
                <div className="text-center md:text-left">
                <p className="text-xl md:text-2xl font-medium">Visualisez l'évolution de vos algorithmes de tri en temps réel</p>
                <p className="text-lg mt-2">Découvrez et comparez les algorithmes de tri comme jamais auparavant !</p>
                </div>
            </div>
            
        </header>
    );
}