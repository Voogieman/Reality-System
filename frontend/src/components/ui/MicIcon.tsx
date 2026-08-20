type Props = {
  listening?: boolean;
};

export function MicIcon({ listening = false }: Props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      {listening ? (
        <circle cx="12" cy="12" r="6" fill="currentColor" />
      ) : (
        <>
          <path
            fill="currentColor"
            d="M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3Zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.9V21h2v-3.1A7 7 0 0 0 19 11h-2Z"
          />
        </>
      )}
    </svg>
  );
}
