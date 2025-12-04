import React, { useState, useRef } from 'react';
import useSWR from 'swr';
import { useRouter } from 'next/router';
import styles from './Form.module.css';
import { 
  PackagePlus, 
  Save, 
  Image as ImageIcon, 
  UploadCloud, 
  Loader2, 
  Layers, 
  FileText 
} from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const ProductForm = () => {
  const router = useRouter();
  const { data: categories, error: categoriesError } = useSWR('/api/categories', fetcher);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError(null);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('category_id', categoryId || '');
    if (imageFile) {
      formData.append('image', imageFile);
    }

    const res = await fetch('/api/products', {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      const newProduct = await res.json();
      router.push(`/manage/products/${newProduct.id}`);
    } else {
      const err = await res.json();
      setFormError(err.error || 'Bir hata oluştu.');
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.ambientLight1}></div>
      <div className={styles.ambientLight2}></div>

      <div className={styles.contentContainer}>
        
        {/* Header */}
        <header className={styles.glassHeader}>
          <div className={styles.headerLeft}>
            <div className={styles.iconBox}>
              <PackagePlus size={28} />
            </div>
            <div>
              <h1 className={styles.pageTitle}>Yeni Ürün Ekle</h1>
              <p className={styles.pageSubtitle}>Mağazanıza yeni bir ürün oluşturun</p>
            </div>
          </div>
        </header>

        {/* Form Kartı */}
        <div className={styles.glassCard}>
          <form onSubmit={handleSubmit} className={styles.formContent}>
            
            <div className={styles.row}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <PackagePlus size={14} /> Ürün Adı
                </label>
                <input
                  type="text"
                  className={styles.glassInput}
                  placeholder="Örn: Oversize T-Shirt"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <Layers size={14} /> Kategori
                </label>
                <select
                  className={styles.glassSelect}
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                >
                  <option value="">Kategori Seçiniz</option>
                  {categories?.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                <FileText size={14} /> Açıklama
              </label>
              <textarea
                className={styles.glassTextarea}
                placeholder="Ürün hakkında detaylı bilgi..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                <ImageIcon size={14} /> Ürün Görseli
              </label>
              
              <div className={styles.imageUploadWrapper}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className={styles.hiddenFileInput}
                  id="product-image-upload"
                />

                {!imagePreview ? (
                  <label htmlFor="product-image-upload" className={styles.uploadBox}>
                    <div className={styles.uploadIconCircle}>
                      <UploadCloud size={24} />
                    </div>
                    <span className={styles.uploadText}>Görsel Yüklemek İçin Tıklayın</span>
                    <span className={styles.uploadSubText}>PNG, JPG, WEBP (Max 5MB)</span>
                  </label>
                ) : (
                  <div className={styles.previewContainer}>
                    <img src={imagePreview} alt="Preview" className={styles.previewImage} />
                    
                    {/* MANUEL SVG İKONLU SİLME BUTONU */}
                    <button 
                      type="button" 
                      onClick={handleRemoveImage} 
                      className={styles.removeImageBtn}
                      title="Görseli Kaldır"
                    >
                      {/* SVG Kodu (Çöp Kutusu) */}
                      <svg 
                        width="20" 
                        height="20" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                    </button>
                    
                    <div className={styles.previewOverlay}>
                      <span>Görsel Seçildi</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {formError && <div className={styles.errorBanner}>{formError}</div>}

            <div className={styles.formFooter}>
              <button type="submit" className={styles.submitBtn} disabled={isLoading}>
                {isLoading ? (
                  <><Loader2 className={styles.spin} size={20} /> Kaydediliyor...</>
                ) : (
                  <><Save size={20} /> Kaydet ve Devam Et</>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;