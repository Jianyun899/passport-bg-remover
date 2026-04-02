export default function HowItWorks() {
  const steps = [
    {
      step: '01',
      title: 'Upload Your Photo',
      desc: 'Drag & drop or click to upload your passport photo. JPG, PNG, WEBP supported.',
      icon: '📤',
    },
    {
      step: '02',
      title: 'AI Removes Background',
      desc: 'Our AI instantly removes the background with precision — even around hair.',
      icon: '✨',
    },
    {
      step: '03',
      title: 'Choose Color & Download',
      desc: 'Pick your required background color, select size, and download your photo.',
      icon: '⬇️',
    },
  ]

  return (
    <section className="py-12">
      <h2 className="text-2xl font-bold text-center text-slate-800 mb-8">How It Works</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {steps.map((step, i) => (
          <div key={step.step} className="relative flex flex-col items-center text-center gap-4">
            {/* Connector line */}
            {i < steps.length - 1 && (
              <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-slate-200" />
            )}
            <div className="w-20 h-20 rounded-2xl bg-blue-50 flex items-center justify-center text-3xl shadow-sm z-10">
              {step.icon}
            </div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full z-20">
              {step.step}
            </div>
            <div>
              <h3 className="font-semibold text-slate-700">{step.title}</h3>
              <p className="text-sm text-slate-500 mt-1">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
