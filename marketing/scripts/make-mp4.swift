import AppKit
import AVFoundation
import CoreVideo

let args = CommandLine.arguments

guard args.count >= 5 else {
    fputs("Usage: swift make-mp4.swift output.mp4 frame1.png frame2.png frame3.png\n", stderr)
    exit(1)
}

let outputURL = URL(fileURLWithPath: args[1])
let imageURLs = args.dropFirst(2).map { URL(fileURLWithPath: $0) }
let width = 1080
let height = 1920
let fps: Int32 = 30
let secondsPerSlide = 5

try? FileManager.default.removeItem(at: outputURL)

let writer = try AVAssetWriter(outputURL: outputURL, fileType: .mp4)
let settings: [String: Any] = [
    AVVideoCodecKey: AVVideoCodecType.h264,
    AVVideoWidthKey: width,
    AVVideoHeightKey: height,
    AVVideoCompressionPropertiesKey: [
        AVVideoAverageBitRateKey: 8_000_000,
        AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel
    ]
]

let input = AVAssetWriterInput(mediaType: .video, outputSettings: settings)
input.expectsMediaDataInRealTime = false

let attributes: [String: Any] = [
    kCVPixelBufferPixelFormatTypeKey as String: Int(kCVPixelFormatType_32ARGB),
    kCVPixelBufferWidthKey as String: width,
    kCVPixelBufferHeightKey as String: height,
    kCVPixelBufferCGImageCompatibilityKey as String: true,
    kCVPixelBufferCGBitmapContextCompatibilityKey as String: true
]

let adaptor = AVAssetWriterInputPixelBufferAdaptor(assetWriterInput: input, sourcePixelBufferAttributes: attributes)

guard writer.canAdd(input) else {
    fputs("Cannot add writer input\n", stderr)
    exit(1)
}
writer.add(input)

func loadCGImage(_ url: URL) -> CGImage {
    guard
        let image = NSImage(contentsOf: url),
        let cg = image.cgImage(forProposedRect: nil, context: nil, hints: nil)
    else {
        fputs("Cannot load image: \(url.path)\n", stderr)
        exit(1)
    }
    return cg
}

func makePixelBuffer(from cgImage: CGImage, pool: CVPixelBufferPool) -> CVPixelBuffer {
    var maybeBuffer: CVPixelBuffer?
    CVPixelBufferPoolCreatePixelBuffer(nil, pool, &maybeBuffer)
    guard let buffer = maybeBuffer else {
        fputs("Cannot create pixel buffer\n", stderr)
        exit(1)
    }

    CVPixelBufferLockBaseAddress(buffer, [])
    let data = CVPixelBufferGetBaseAddress(buffer)
    let bytesPerRow = CVPixelBufferGetBytesPerRow(buffer)
    let colorSpace = CGColorSpaceCreateDeviceRGB()
    guard let context = CGContext(
        data: data,
        width: width,
        height: height,
        bitsPerComponent: 8,
        bytesPerRow: bytesPerRow,
        space: colorSpace,
        bitmapInfo: CGImageAlphaInfo.noneSkipFirst.rawValue
    ) else {
        fputs("Cannot create CGContext\n", stderr)
        exit(1)
    }

    context.setFillColor(NSColor.black.cgColor)
    context.fill(CGRect(x: 0, y: 0, width: width, height: height))
    context.draw(cgImage, in: CGRect(x: 0, y: 0, width: width, height: height))
    CVPixelBufferUnlockBaseAddress(buffer, [])
    return buffer
}

let images = imageURLs.map(loadCGImage)

writer.startWriting()
writer.startSession(atSourceTime: .zero)

guard let pool = adaptor.pixelBufferPool else {
    fputs("Missing pixel buffer pool\n", stderr)
    exit(1)
}

var frameIndex: Int64 = 0
let framesPerSlide = Int(fps) * secondsPerSlide

for image in images {
    let buffer = makePixelBuffer(from: image, pool: pool)
    for _ in 0..<framesPerSlide {
        while !input.isReadyForMoreMediaData {
            Thread.sleep(forTimeInterval: 0.005)
        }
        let time = CMTime(value: frameIndex, timescale: fps)
        adaptor.append(buffer, withPresentationTime: time)
        frameIndex += 1
    }
}

input.markAsFinished()

let semaphore = DispatchSemaphore(value: 0)
writer.finishWriting {
    semaphore.signal()
}
semaphore.wait()

if writer.status != .completed {
    fputs("Writer failed: \(writer.error?.localizedDescription ?? "unknown error")\n", stderr)
    exit(1)
}

print(outputURL.path)
