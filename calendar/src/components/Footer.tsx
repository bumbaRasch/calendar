export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="text-sm text-gray-600">
            © {currentYear} My Calendar App. Built with React 19 & TanStack Router.
          </div>
          
          <div className="flex space-x-6 text-sm text-gray-600">
            <a 
              href="#" 
              className="hover:text-gray-900 transition-colors"
            >
              About
            </a>
            <a 
              href="#" 
              className="hover:text-gray-900 transition-colors"
            >
              Privacy
            </a>
            <a 
              href="#" 
              className="hover:text-gray-900 transition-colors"
            >
              Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}