export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="text-sm text-gray-600">
            © {currentYear} My Calendar App. Built with React 19 & TanStack
            Router.
          </div>

          <div className="flex space-x-6 text-sm text-gray-600">
            <button
              type="button"
              className="hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
              onClick={() => {
                /* About functionality will be implemented later */
              }}
            >
              About
            </button>
            <button
              type="button"
              className="hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
              onClick={() => {
                /* Privacy functionality will be implemented later */
              }}
            >
              Privacy
            </button>
            <button
              type="button"
              className="hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
              onClick={() => {
                /* Support functionality will be implemented later */
              }}
            >
              Support
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
