require 'rake'
require 'xml/smart'

task :icons do
  Dir.glob(File.dirname(__FILE__) + "/icons/*.svg").each do |f|
    XML::Smart.modify(f) do |doc|
      doc.root.attributes['viewBox'] = "0 0 #{doc.root.attributes['width']} #{doc.root.attributes['height']}"
    end
  end
end

task :default => [:icons] do
  puts `cd icons; fontcustom compile . --name uidash-icons --no-hash`
end
