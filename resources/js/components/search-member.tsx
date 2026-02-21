"use client"

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"

type Data = {
  id: number
  nama: string
  diskon: number
  saldo: number
}

type SearchMemberProps = {
  cn: string
  data: Data[]
  value: string
  onChange: (value: string) => void
}

export function SearchMember({ cn, data, value, onChange }:SearchMemberProps) {
  return (
    <Combobox items={data} defaultValue={""}>
      <ComboboxInput className={cn} placeholder="Cari Member" onChange={onChange} />
      <ComboboxContent>
        <ComboboxEmpty>No items found.</ComboboxEmpty>
        <ComboboxList>
          {(item) => (
            <ComboboxItem key={item.id} value={item.nama}>
              {item.nama}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

