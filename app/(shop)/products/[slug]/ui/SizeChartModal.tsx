"use client";

import Image from "next/image";
import Modal from "@/components/Modal";

export default function SizeChartModal({
  open,
  onClose,
  image,
}: {
  open: boolean;
  onClose: () => void;
  image?: string | null;
}) {
  return (
    <Modal open={open} onClose={onClose} title="Tabel Ukuran">
      {!image ? (
        <div className="rounded-xl border bg-gray-50 p-4 text-sm text-gray-600">
          Size chart belum tersedia untuk produk ini.
        </div>
      ) : (
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl border bg-gray-50">
          <Image
            src={image}
            alt="Tabel Ukuran"
            fill
            className="object-contain"
            sizes="(max-width: 1024px) 92vw, 900px"
          />
        </div>
      )}
    </Modal>
  );
}
