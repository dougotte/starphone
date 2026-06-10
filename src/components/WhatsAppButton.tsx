export default function WhatsAppButton() {
  const phoneNumber = '5519999921698';
  const message = 'Olá! Gostaria de mais informações sobre os produtos.';

  const handleClick = () => {
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 bg-[#25D366] hover:bg-[#1ebe5d] text-white rounded-full p-3.5 shadow-lg transition-all hover:scale-110 z-50 flex items-center justify-center"
      aria-label="Fale conosco no WhatsApp"
      title="Fale conosco no WhatsApp"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        width="30"
        height="30"
        fill="white"
      >
        <path d="M16.004 2C8.28 2 2 8.28 2 16.004c0 2.46.638 4.865 1.852 6.988L2 30l7.236-1.898A13.94 13.94 0 0 0 16.004 30C23.72 30 30 23.72 30 16.004 30 8.28 23.72 2 16.004 2zm0 25.52a11.5 11.5 0 0 1-5.872-1.607l-.42-.25-4.293 1.127 1.145-4.185-.274-.43A11.517 11.517 0 0 1 4.48 16.004C4.48 9.65 9.65 4.48 16.004 4.48c6.356 0 11.52 5.17 11.52 11.524 0 6.354-5.164 11.516-11.52 11.516zm6.32-8.63c-.347-.174-2.053-1.013-2.373-1.128-.32-.117-.553-.174-.786.174-.232.347-.9 1.128-1.103 1.36-.203.232-.406.26-.754.086-.347-.174-1.466-.54-2.793-1.723-1.032-.92-1.73-2.055-1.932-2.403-.203-.347-.022-.535.153-.708.157-.155.347-.406.52-.61.175-.204.233-.348.348-.58.116-.232.058-.435-.029-.61-.087-.174-.786-1.894-1.077-2.594-.283-.682-.572-.59-.786-.6l-.668-.012c-.232 0-.61.087-.928.435-.318.348-1.218 1.19-1.218 2.9 0 1.71 1.247 3.362 1.42 3.594.174.232 2.454 3.75 5.944 5.26.831.358 1.48.572 1.985.732.833.265 1.592.228 2.19.138.668-.1 2.053-.84 2.344-1.652.29-.812.29-1.508.203-1.652-.086-.145-.318-.232-.665-.406z" />
      </svg>
    </button>
  );
}
