const EventCard = ({ title, image }) => {
  return (
    <div className="group relative overflow-hidden rounded-xl bg-zinc-900 shadow-lg">
      {/* Image */}
      <img
        src={image}
        alt={title}
        className="h-60 w-full object-cover transform group-hover:scale-110 transition duration-700"
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition duration-500"></div>

      {/* Text */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 translate-y-10 group-hover:translate-y-0 transition duration-500">
        <h3 className="text-xl font-semibold text-white">{title}</h3>
        <p className="text-sm text-gray-300 mt-2">
          Elegant planning & flawless execution
        </p>
      </div>
    </div>
  );
};

export default EventCard;
