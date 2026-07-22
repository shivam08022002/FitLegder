import ThreeDFeatureCarousel, { stepCards } from './ThreeDFeatureCarousel';

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative mx-auto max-w-[1400px] px-4 sm:px-6 pt-6 pb-2 sm:pt-8 sm:pb-4">
      <div className="mx-auto mb-4 max-w-2xl text-center">
        <span className="section-label">Interactive Onboarding Guide</span>
        <h2 className="mt-2 text-balance text-2xl font-bold sm:text-4xl md:text-5xl">
          Up and running in six simple steps
        </h2>
        <p className="mt-2 text-pretty text-sm leading-relaxed text-slate-400 sm:text-base">
          Rotate the 3D step-by-step onboarding carousel below to see how easy it is to start with GymArchive.
        </p>
      </div>

      {/* 3D Interactive Steps Carousel with exact same card size, width, gap, and padding as Features */}
      <ThreeDFeatureCarousel
        cards={stepCards}
        ctaPrefix="Learn About"
        faceWidthOverride={250}
        stageHeightClass="h-[350px] sm:h-[460px]"
      />
    </section>
  );
}
