import { Facebook, Instagram, Twitter } from "lucide-react";
import Link from "next/link";
export function Footer() {
  return (
    <footer className="border-t mt-16">
      <div className="container mx-auto py-10 grid gap-8 md:grid-cols-3">
        <div>
          <div className="text-xl font-extrabold">CakeHaven</div>
          <p className="mt-3 text-muted-foreground max-w-sm">
            Your one-stop marketplace for delightful cakes. Discover top
            bakeries and order in minutes.
          </p>
        </div>
        <nav className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="font-semibold">Company</div>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>
                <Link href="/about" className="hover:text-foreground">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-foreground">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-2">
            <div className="font-semibold">Legal</div>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>
                <Link href="/terms" className="hover:text-foreground">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-foreground">
                  Privacy
                </Link>
              </li>
            </ul>
          </div>
        </nav>
        <div className="flex md:justify-end items-start gap-3">
          <a
            href="#"
            aria-label="Instagram"
            className="p-2 rounded-full bg-secondary hover:bg-secondary/80"
          >
            <Instagram />
          </a>
          <a
            href="#"
            aria-label="Twitter"
            className="p-2 rounded-full bg-secondary hover:bg-secondary/80"
          >
            <Twitter />
          </a>
          <a
            href="#"
            aria-label="Facebook"
            className="p-2 rounded-full bg-secondary hover:bg-secondary/80"
          >
            <Facebook />
          </a>
        </div>
      </div>
      <div className="border-t py-4 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} CakeHaven. All rights reserved.
      </div>
    </footer>
  );
}
