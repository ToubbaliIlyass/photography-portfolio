export default function Footer() {
  return (
    <footer className="mt-auto py-12 px-6">
      <div className="max-w-4xl mx-auto flex flex-col items-center gap-6">
        {/* Logo */}
        <h2 className="font-brand-display text-4xl text-stone-700">Abstracta</h2>

        {/* Contact Links */}
        <div className="flex flex-col sm:flex-row items-center gap-6 text-sm text-stone-600">
          <a 
            href="mailto:toubbaliilyasse@gmail.com" 
            className="hover:text-amber-700 transition-colors"
          >
            toubbaliilyasse@gmail.com
          </a>
          <span className="hidden sm:inline text-stone-300">•</span>
          <a 
            href="https://instagram.com/ilyasstoubbali" 
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-amber-700 transition-colors"
          >
            @ilyasstoubbali
          </a>
        </div>

        {/* Copyright */}
        <p className="text-xs text-stone-500 tracking-wide">
          © {new Date().getFullYear()} ABSTRACTA GALLERY. ALL RIGHTS RESERVED.
        </p>
      </div>
    </footer>
  );
}
