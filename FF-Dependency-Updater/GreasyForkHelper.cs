using System.Net.Http;
using System.Threading.Tasks;

using FF_Dependency_Updater;

using HtmlAgilityPack;

namespace FF_Dependency_Lib;

#nullable enable
public static class GreasyForkHelper
{
    public static async Task<LibraryUrl> GetLibraryUrlFromScriptUrl(ScriptUrl scriptUrl)
    {
        using var client = new HttpClient();
        var html = await client.GetStringAsync(scriptUrl.ToString());

        var doc = new HtmlDocument();
        doc.LoadHtml(html);

        // Find the element with ID 'script-content'
        var scriptContentNode = doc.DocumentNode.SelectSingleNode("//div[@id='script-content']");

        // Get the first child of script-content
        var pElem = scriptContentNode?.SelectSingleNode(".//p");

        // Find the <code> element inside
        var codeNode = pElem?.SelectSingleNode(".//code");

        // Get the text content and split by '/'
        return LibraryUrl.Parse(codeNode!.InnerText);
    }
}
