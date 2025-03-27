"use client"

import { ReactElement, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Twitter, Globe } from "lucide-react"

export default function SuccinctSocials(): ReactElement {
    const [isOpen, setIsOpen] = useState<boolean>(false)

    const toggleOpen = () => {
        setIsOpen(!isOpen)
    }

    return (
        <div className="fixed right-4 bottom-0 -translate-y-1/2 z-50">
            {/* Toggle button */}
            <button
                onClick={toggleOpen}
                className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all duration-300 mb-2"
            >
                {isOpen ? <Globe size={24} /> : <Globe size={24} />}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        transition={{ duration: 0.3 }}
                        className="flex flex-col space-y-3"
                    >


                        <motion.a
                            href="https://twitter.com/SuccinctLabs"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Twitter size={20} />
                        </motion.a>



                        <motion.a
                            href="https://succinct.xyz"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <Globe size={20} />
                        </motion.a>


                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

