function Debrief() {
  return (
    <ul className="p-4 space-y-4 rounded-lg shadow-md bg-ctp-surface">
      <li className="text-lg leading-relaxed text-ctp-text">
        <strong>Thank you</strong> for participating in this survey on the use
        of artificial intelligence (AI) algorithms in modern surveillance
        systems. Your input is valuable to this research.
      </li>
      <li className="text-lg leading-relaxed text-ctp-text">
        <strong>Purpose of the Study:</strong> This research aims to understand
        public perceptions of AI-driven surveillance and how these opinions
        might inform policy decisions regarding privacy, security, and ethics.
      </li>
      <li className="text-lg leading-relaxed text-ctp-text">
        <strong>Data Confidentiality:</strong> All responses are anonymous, and
        no personally identifiable information has been collected. Data will be
        used solely for research purposes and deleted after use.
      </li>
      <li className="text-lg leading-relaxed text-ctp-text">
        <strong>Contact Information:</strong> If you have any questions about
        this study, please don't hesitate to contact Graeme Kieran at
        <a
          href="mailto:gk32855@pausd.us"
          className="font-bold underline text-ctp-lavender"
        >
          {' '}
          gk32855@pausd.us{' '}
        </a>
        or my research advisor, Samuel Howles-Banerji,
        <br /> at
        <a
          href="mailto:showles-banerji@pausd.org"
          className="font-bold underline text-ctp-lavender"
        >
          {' '}
          showles-banerji@pausd.org
        </a>
      </li>
      <li className="text-lg leading-relaxed text-ctp-text">
        <strong>Your response</strong> has been collected, and you are free to leave this page.
      </li>
    </ul>
  )
}
export default Debrief
