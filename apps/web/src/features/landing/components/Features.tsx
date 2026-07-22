import ThreeDFeatureCarousel from './ThreeDFeatureCarousel';

export default function Features() {
  return (
    <section id="features" className="scroll-mt-20 sm:scroll-mt-24 relative mx-auto max-w-[1400px] px-4 sm:px-6 pt-10 pb-4 sm:pt-14 sm:pb-6">
      <div className="mx-auto mb-6 max-w-2xl text-center">
        <span className="section-label">Interactive 3D Showcase</span>
        <h2 className="mt-2 text-balance text-2xl font-bold sm:text-4xl md:text-5xl">
          The complete toolkit to run your gym
        </h2>
        <p className="mt-2 text-pretty text-sm leading-relaxed text-slate-400 sm:text-base">
          Rotate the 3D carousel below to explore GymArchive's feature suite or click any card for full details.
        </p>
      </div>

      {/* Increased mobile vertical stage padding (h-[350px]) & wider desktop card width (250px) */}
      <ThreeDFeatureCarousel
        faceWidthOverride={250}
        stageHeightClass="h-[350px] sm:h-[460px]"
      />
    </section>
  );
}
