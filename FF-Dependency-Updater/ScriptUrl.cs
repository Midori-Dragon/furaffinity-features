using System;
using System.Threading.Tasks;

namespace FF_Dependency_Updater;

#nullable enable
public sealed class ScriptUrl
{
    public ulong Id { get; set; }
    public string Name { get; set; } = string.Empty;

    public override string ToString() => $"https://greasyfork.org/scripts/{Id}-{Name.ToLower().Replace(' ', '-')}";
    public static ScriptUrl Parse(string url)
    {
        var parts = url.Split('/');
        var parts2 = parts[parts.Length - 1].Split(['-'], 2);

        var idPart = parts2[parts2.Length - 2];
        var namePart = parts2[parts2.Length - 1];

        Console.WriteLine($"ScriptUrl: {idPart}/{namePart}");

        return new ScriptUrl
        {
            Id = ulong.Parse(idPart),
            Name = namePart
        };
    }
    public async Task<LibraryUrl> ToLibraryUrlAsync() => await LibraryUrl.FromScriptUrlAsync(this);
}
