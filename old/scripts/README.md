# DeepFly Model Setup

Bu klasör, EfficientNet-B0 deepfake detection modelini indirip TensorFlow.js formatına çevirir.

## 🚀 Hızlı Kurulum (Windows)

1. **Python'un kurulu olduğundan emin ol** (Python 3.8+)
   - İndir: https://www.python.org/downloads/

2. **Batch dosyasını çalıştır:**
   ```
   setup_model.bat
   ```

3. **Tamamlandığında** model şu konumda olacak:
   ```
   assets/models/deepfake/
   ├── model.json
   └── group1-shard*.bin
   ```

## 💻 Manuel Kurulum

```bash
# 1. Gerekli paketleri yükle
pip install torch torchvision tensorflow tensorflowjs timm huggingface_hub

# 2. Script'i çalıştır
python download_and_convert_model.py
```

## 📊 Model Bilgileri

| Özellik | Değer |
|---------|-------|
| Model | EfficientNet-B0 |
| Eğitim Verisi | ImageNet + Deepfake fine-tuning |
| Input Boyutu | 224×224×3 |
| Output | [real_prob, fake_prob] |
| Boyut | ~15-20 MB |

## ⚠️ Sorun Giderme

### "pip not found"
```bash
python -m pip install --upgrade pip
```

### "CUDA error"
GPU gerekli değil, CPU modunda çalışır:
```bash
pip install tensorflow-cpu
```

### Model yüklenmiyor
1. `assets/models/deepfake/` klasörünü kontrol et
2. `model.json` dosyası olmalı
3. En az bir `.bin` dosyası olmalı

## 🔗 Model Kaynakları

- [EfficientNet Paper](https://arxiv.org/abs/1905.11946)
- [FaceForensics++](https://github.com/ondyari/FaceForensics)
- [TensorFlow.js](https://www.tensorflow.org/js)




