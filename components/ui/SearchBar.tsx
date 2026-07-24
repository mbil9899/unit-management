import { Search } from "lucide-react";
import Input from "./Input";

export default function SearchBar() {
  return (
    <div className="relative w-96">
      <Search
        className="absolute left-3 top-3 h-5 w-5 text-slate-400"
      />

      <Input
        className="pl-10"
        placeholder="Search personnel..."
      />
    </div>
  );
}