import Hero from "../components/Hero";
import EventCard from "../components/EventCard";
import Footer from "../components/Footer";

const Home = () => {
  return (
    <>
      <Hero />

      <section className="fade-in px-10 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          Our <span className="text-orange-500">Events</span>
        </h2>

        <div className="grid md:grid-cols-3 gap-10">
          <EventCard
            title="Wedding Events"
            image="https://images.unsplash.com/photo-1519225421980-715cb0215aed"
          />
          <EventCard
            title="Corporate Events"
            image="https://images.unsplash.com/photo-1503428593586-e225b39bddfe"
          />
          <EventCard
            title="Music Concerts"
            image="https://images.unsplash.com/photo-1497032628192-86f99bcd76bc"
          />
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Home;
