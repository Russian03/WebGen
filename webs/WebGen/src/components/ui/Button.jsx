export default function Button({
  children,
  onClick,
  className = "",
  type = "button"
}) {

  return (

    <button
      type={type}
      onClick={onClick}

      className={`
        rounded-2xl
        bg-white
        text-black
        px-6
        py-3
        font-medium
        hover:scale-105
        transition-all
        duration-300

        ${className}
      `}
    >
      {children}
    </button>

  );
}