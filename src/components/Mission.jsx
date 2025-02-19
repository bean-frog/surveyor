function Mission() {
  return (
    <div className="flex flex-col justify-between items-center mt-auto w-full min-h-screen">
      <div className="flex flex-col flex-grow justify-center items-center w-full">
        <div className="flex flex-col justify-center items-center p-6 pb-2 rounded-lg lg:w-3/5 md:w-4/5 sm:w-full h-fit mb-6 overflow-y-hidden mb-auto max-h-[90vh] min-h-0">
          <ul className="space-y-4 p-4 bg-ctp-surface rounded-lg shadow-md">
            <li className="text-lg text-ctp-text leading-relaxed">
              <strong>Mission Statement:</strong> This research aims to explore
              public opinions on the use of artificial intelligence (AI) in
              modern surveillance systems. By understanding societal
              perceptions, this study seeks to contribute to discussions on
              ethical AI deployment and inform potential policy recommendations.
            </li>
            <li className="text-lg text-ctp-text leading-relaxed">
              <strong>Why This Matters:</strong> AI-powered surveillance is
              becoming increasingly prevalent in law enforcement, security, and
              public monitoring. Public trust and ethical considerations play a
              crucial role in shaping responsible AI policies.
            </li>
            <li className="text-lg text-ctp-text leading-relaxed">
              <strong>Our Goals:</strong> This research aims to:
              <ul className="list-disc list-inside text-ctp-subtext">
                <li>
                  Analyze public concerns and acceptance of AI-driven
                  surveillance.
                </li>
                <li>
                  Highlight ethical, legal, and social implications of such
                  technologies.
                </li>
                <li>
                  Provide data-driven insights that can inform AI policy
                  discussions.
                </li>
              </ul>
            </li>
            <li className="text-lg text-ctp-text leading-relaxed">
              <strong>Your Role:</strong> By participating in this survey, you
              are contributing to an important discussion about the future of AI
              in surveillance. Your honest opinions will help shape a more
              informed perspective on AI governance and its societal impact.
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
export default Mission
