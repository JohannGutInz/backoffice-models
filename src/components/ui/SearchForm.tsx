import { Search } from "lucide-react";
import { Input } from "@/components/ui/Input";

export function SearchForm({
  action,
  placeholder,
  defaultValue,
}: {
  action: string;
  placeholder: string;
  defaultValue?: string;
}) {
  return (
    <form action={action} method="GET" className="max-w-xs flex-1">
      <Input type="text" name="q" defaultValue={defaultValue} placeholder={placeholder} icon={<Search />} />
    </form>
  );
}
