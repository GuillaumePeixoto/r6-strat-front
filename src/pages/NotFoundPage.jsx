import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function NotFoundPage() {
  const cascadeCount = 4;
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    const timers = [];

    for (let i = 1; i <= cascadeCount; i++) {
      const timer = setTimeout(() => {
        setVisibleCount(i);
      }, i * 150);

      timers.push(timer);
    }

    return () => timers.forEach((id) => clearTimeout(id));
  }, []);

  const getStyle = (index) => ({
    position: 'absolute',
    top: `calc(50% - ${index * 20}px)`,
    left: `calc(50% - ${index * 20}px)`,
    transform: 'translate(-50%, -50%)',
    zIndex: cascadeCount - index, // L'index 0 (centre) aura le zIndex le plus élevé (4)
  });

  // Génère les index en partant du fond (ex: 3, 2, 1, 0)
  const visibleIndices = Array.from(
    { length: visibleCount },
    (_, i) => cascadeCount - 1 - i
  );

  return (
    <div className="relative flex items-center justify-center min-h-[70vh] text-white">
      {visibleIndices.map((index) => (
        <div
          key={index}
          className="bg-neutral-800 border-2 border-(--yellow) rounded-lg w-96 p-6 flex flex-col items-center text-center shadow-xl transition-all duration-300"
          style={getStyle(index)}
        >
          <i className="bi bi-exclamation-triangle-fill text-5xl text-(--yellow) mb-3"></i>
          <h1 className="text-2xl font-bold">Error 404</h1>
          <p className="text-neutral-400 mt-2">
            Looks like an invisible wall! No secret rooms or loot found here.
          </p>
          <Link
            to="/"
            className="mt-5 text-lg cursor-pointer py-2 px-6 bg-(--yellow) rounded-md font-bold hover:bg-transparent hover:text-(--yellow) border-2 border-(--yellow) transition-colors"
          >
            OK
          </Link>
        </div>
      ))}
    </div>
  );
}

export default NotFoundPage;