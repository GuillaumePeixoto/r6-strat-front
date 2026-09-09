function Footer() {
  return (
    <footer className="background-light-black text-gray-300 text-center bg-zinc-700">
      <div className="py-4">
        <p className="">&copy; { new Date().getFullYear() } R6 Strat Maker</p>
        <ul className="flex justify-center space-x-4 text-sm"></ul>
      </div>
    </footer>
  );
}

export default Footer;
