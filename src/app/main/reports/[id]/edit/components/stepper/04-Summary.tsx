import React from 'react';
import { UseFormWatch } from 'react-hook-form';
import { BsFillInfoCircleFill } from 'react-icons/bs';
import { MdDescription, MdLocationOn, MdPhoto, MdTitle, MdTrackChanges } from 'react-icons/md';
import { Accordion } from '@/components';
import { IEditReportRequest, ImageItem } from '@/types';
import { FaFileAlt, FaTags } from 'react-icons/fa';
import Image from 'next/image';
import { useImagePreviewModalStore } from '@/stores';

interface SummaryStepProps {
    watch: UseFormWatch<IEditReportRequest>;
    reportImages: ImageItem[];
    reportImagesCount: number;
}

const issueTypes = [
        { value: 'infrastructure', label: 'Infrastruktur' },
        { value: 'environment', label: 'Lingkungan' },
        { value: 'safety', label: 'Keamanan' },
        { value: 'traffic', label: 'Lalu Lintas' },
        { value: 'public_facility', label: 'Fasilitas Umum' },
        { value: 'waste', label: 'Sampah' },
        { value: 'water', label: 'Air' },
        { value: 'electricity', label: 'Listrik' },
        { value: 'health', label: 'Kesehatan' },
        { value: 'social', label: 'Sosial' },
        { value: 'education', label: 'Pendidikan' },
        { value: 'administrative', label: 'Administrasi' },
        { value: 'disaster', label: 'Bencana Alam' },
        { value: 'other', label: 'Lainnya' },
];

const SummaryRow: React.FC<{ icon: React.ReactNode; label: string; children: React.ReactNode }> = ({
    icon, label, children,
}) => (
    <div className="grid grid-cols-[160px_1fr] gap-2 py-3.5 px-3 border-b border-surface/5 last:border-b items-start">
        <div className="flex items-center gap-2 text-sm md:text-md">
            <span className="text-surface">{icon}</span>
            {label}
        </div>
        <div className="text-sm md:text-md text-surface min-w-0 break-words">{children}</div>
    </div>
);

const SummaryStep: React.FC<SummaryStepProps> = ({ watch, reportImagesCount, reportImages }) => {
    const hasProgressValue = watch('hasProgress');
    const reportType = issueTypes.find(t => t.value === watch('reportType'))?.label;
    const openImagePreview = useImagePreviewModalStore((s) => s.openImagePreview);

    const onImageClick = (imageURL: string) => {
        openImagePreview(imageURL);
    }

    return (
        <div className="space-y-4">
            <div className="bg-primary/10 rounded-lg py-4 px-3 border-l-5 border-primary">
                <div className="flex items-center gap-3">
                    <div className="">
                        <BsFillInfoCircleFill className="w-4.5 h-4.5 text-primary" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-primary">
                            Pastikan semua informasi sudah benar sebelum mengirim laporan.
                        </p>
                        <p className="text-sm text-primary mt-1">
                            Anda dapat kembali ke langkah sebelumnya untuk memeriksa atau mengubah data.
                        </p>
                    </div>
                </div>
            </div>

            <Accordion type="single" defaultValue={['summary']}>
                <Accordion.Item
                    id="summary"
                    title="Ringkasan Laporan"
                    headerClassName="bg-gray-50"
                    className="border border-gray-200 rounded-xl overflow-hidden"
                >
                    <div className="divide-y divide-gray-100">
                        <SummaryRow icon={<FaFileAlt />} label="Judul laporan">
                            <span className="font-medium">{watch('reportTitle') || '-'}</span>
                        </SummaryRow>

                        <SummaryRow icon={<FaTags />} label="Jenis laporan">
                            {reportType
                                ? <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary text-white">{reportType}</span>
                                : <span className="text-gray-400">-</span>
                            }
                        </SummaryRow>

                        <SummaryRow icon={<MdTrackChanges />} label="Fitur progress">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                                hasProgressValue ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'
                            }`}>
                                {hasProgressValue && <MdTrackChanges size={13} />}
                                {hasProgressValue ? 'Diaktifkan' : 'Tidak diaktifkan'}
                            </span>
                        </SummaryRow>

                        <SummaryRow icon={<MdLocationOn />} label="Lokasi">
                            <span className="text-gray-700">{watch('location') || '-'}</span>
                        </SummaryRow>

                        <SummaryRow icon={<MdDescription />} label="Deskripsi">
                            <span className="text-gray-600 leading-relaxed">
                                {watch('reportDescription') || '-'}
                            </span>
                        </SummaryRow>

                        <SummaryRow icon={<MdPhoto />} label="Lampiran foto">
                            {reportImagesCount > 0 ? (
                                <div className="space-y-2">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary text-white">
                                        {reportImagesCount} foto dilampirkan
                                    </span>
                                    <div className="flex flex-wrap gap-2">
                                        {reportImages.map((img, index) => (
                                            <div
                                                key={index}
                                                className="cursor-pointer rounded-lg overflow-hidden border border-gray-200 "
                                                onClick={() => onImageClick(img.preview)}
                                            >
                                                <Image
                                                    src={img.preview}
                                                    alt={`Lampiran ${index + 1}`}
                                                    width={72}
                                                    height={72}
                                                    className="w-18 h-18 object-cover"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <span className="text-gray-400 italic text-sm">Tidak ada foto</span>
                            )}
                        </SummaryRow>
                    </div>
                </Accordion.Item>
            </Accordion>
        </div>
    );
};

export default SummaryStep;
