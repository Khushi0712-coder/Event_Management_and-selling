const Hero = () => {
  return (
    <section
      className="h-screen bg-cover bg-center relative"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1507874457470-272b3c8d8ee2')",
      }}
    >
      <div className="absolute inset-0 bg-black/70"></div>

      <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4">
        <h1 className="text-5xl md:text-6xl font-bold tracking-widest">
          <span className="text-orange-500">EVENT</span> MANAGEMENT
        </h1>
        <p className="mt-4 max-w-xl text-gray-300">
          Crafting unforgettable events with precision, creativity, and passion.
        </p>

        <button className="mt-8 px-8 py-3 border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-black transition">
          Explore Events
        </button>

        <div className="mt-16 animate-bounce text-orange-500 text-3xl">↓</div>
      </div>
    </section>
  );
};

export default Hero;
