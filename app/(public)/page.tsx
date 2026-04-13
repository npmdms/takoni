import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckListIcon } from "@hugeicons/core-free-icons";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-start pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-xl space-y-16">
        <section className="space-y-6 text-center sm:text-left">
          <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
            <Badge variant="secondary">v1.0 Early Access</Badge>
            <Badge variant="outline">Status: Public Beta</Badge>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
            [HEADLINE UTAMA ANDA DI SINI]
          </h1>

          <p className="text-lg text-muted-foreground leading-relaxed">
            [Sub-headline atau deskripsi singkat yang menjelaskan masalah apa
            yang Anda selesaikan dalam satu kalimat padat.]
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center sm:justify-start">
            <Button size="lg" className="w-full sm:w-auto">
              Mulai Sekarang <HugeiconsIcon icon={CheckListIcon} />
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Lihat Dokumentasi
            </Button>
          </div>
        </section>

        <Separator className="bg-border/50" />

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">
            Mengapa ini berbeda?
          </h2>
          <div className="grid gap-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="flex items-start gap-4 p-4 rounded-lg border bg-card text-card-foreground shadow-sm"
              >
                <div className="mt-1 bg-primary/10 p-1 rounded">
                  <HugeiconsIcon icon={CheckListIcon} />
                </div>
                <div className="space-y-1">
                  <h3 className="font-medium leading-none">
                    [Fitur Utama {item}]
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    [Penjelasan singkat tentang fitur ini. Fokus pada benefit,
                    bukan teknis.]
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <Separator className="bg-border/50" />

        <section className="grid grid-cols-2 gap-8 py-4">
          <div className="flex flex-col gap-1">
            <span className="text-3xl font-bold">[XX]</span>
            <span className="text-sm text-muted-foreground uppercase tracking-wider">
              Active Users
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-3xl font-bold">[99%]</span>
            <span className="text-sm text-muted-foreground uppercase tracking-wider">
              Uptime
            </span>
          </div>
        </section>

        <Separator className="bg-border/50" />

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight text-center">
            Investasi Sederhana
          </h2>
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <CardTitle>[Nama Paket]</CardTitle>
              <CardDescription>Cocok untuk [Target Audience]</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold mb-6">
                Rp [Harga]{" "}
                <span className="text-base font-normal text-muted-foreground">
                  /bulan
                </span>
              </div>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2">
                  <HugeiconsIcon icon={CheckListIcon} />
                </li>
                <li className="flex items-center gap-2">
                  <HugeiconsIcon icon={CheckListIcon} />
                </li>
                <li className="flex items-center gap-2">
                  <HugeiconsIcon icon={CheckListIcon} />
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Pilih Paket Ini</Button>
            </CardFooter>
          </Card>
        </section>

        <section className="pt-8 pb-12 text-center space-y-6">
          <h2 className="text-2xl font-bold">Siap untuk memulai?</h2>
          <p className="text-muted-foreground">
            [Kalimat penutup yang mengajak bertindak tanpa tekanan.]
          </p>
          <Button size="lg" variant="default">
            Daftar Akun Gratis
          </Button>

          <div className="pt-12 text-xs text-muted-foreground/60">
            &copy; {new Date().getFullYear()} [Nama Perusahaan Anda]. All rights
            reserved.
          </div>
        </section>
      </div>
    </main>
  );
}
